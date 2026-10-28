import pytest
from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import create_app
from app.services.llm_providers import BaseProvider, ProviderError


class FakeProvider(BaseProvider):
    name = "openai"

    def __init__(self, reply: str = "fake answer", fail: bool = False):
        self.reply, self.fail, self.calls = reply, fail, []

    async def complete(self, system, history, message):
        self.calls.append({"system": system, "history": history, "message": message})
        if self.fail:
            raise ProviderError("boom")
        return self.reply


@pytest.fixture
def make_client(monkeypatch):
    """Factory that builds a TestClient with given settings and optional provider override."""

    def _make(provider: BaseProvider | None = None, **overrides):
        get_settings.cache_clear()
        env = {"AI_PROVIDER": "demo", "GEMINI_API_KEY": "", "OPENAI_API_KEY": ""}
        env.update({k.upper(): str(v) for k, v in overrides.items()})
        for k, v in env.items():
            monkeypatch.setenv(k, v)
        monkeypatch.setattr(Settings, "model_config", {**Settings.model_config, "env_file": None})
        app = create_app()
        client = TestClient(app)
        client.__enter__()
        if provider is not None:
            from app.services.chat_service import ChatService

            app.state.chat_service = ChatService(get_settings(), provider=provider)
        return client

    yield _make
    get_settings.cache_clear()
