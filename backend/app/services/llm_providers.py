"""Provider abstraction. Each provider converts (system, history, message) into an answer string."""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod

import httpx

from app.config import Settings
from app.services.demo_provider import demo_answer

log = logging.getLogger(__name__)


class ProviderError(Exception):
    """Raised when the upstream AI provider fails, times out, or returns bad data."""


class BaseProvider(ABC):
    name: str

    @abstractmethod
    async def complete(self, system: str, history: list[dict], message: str) -> str: ...


class DemoProvider(BaseProvider):
    name = "demo"

    async def complete(self, system: str, history: list[dict], message: str) -> str:
        return demo_answer(message, history)


class GeminiProvider(BaseProvider):
    name = "gemini"

    def __init__(self, api_key: str, model: str, timeout: float):
        self.api_key, self.model, self.timeout = api_key, model, timeout

    async def complete(self, system: str, history: list[dict], message: str) -> str:
        url = "https://generativelanguage.googleapis.com/v1beta/models/" f"{self.model}:generateContent"
        contents = [
            {"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]} for m in history
        ]
        contents.append({"role": "user", "parts": [{"text": message}]})
        body = {
            "system_instruction": {"parts": [{"text": system}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.6, "maxOutputTokens": 400},
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.post(url, params={"key": self.api_key}, json=body)
            r.raise_for_status()
            data = r.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
            log.warning("Gemini provider failed: %s", type(exc).__name__)
            raise ProviderError("gemini request failed") from exc


class OpenAIProvider(BaseProvider):
    name = "openai"

    def __init__(self, api_key: str, model: str, timeout: float):
        self.api_key, self.model, self.timeout = api_key, model, timeout

    async def complete(self, system: str, history: list[dict], message: str) -> str:
        messages = [{"role": "system", "content": system}, *history, {"role": "user", "content": message}]
        body = {"model": self.model, "messages": messages, "temperature": 0.6, "max_tokens": 400}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                r = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json=body,
                )
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"].strip()
        except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
            log.warning("OpenAI provider failed: %s", type(exc).__name__)
            raise ProviderError("openai request failed") from exc


def build_provider(settings: Settings) -> BaseProvider:
    provider = settings.effective_provider
    if provider == "gemini":
        return GeminiProvider(settings.gemini_api_key or "", settings.gemini_model, settings.provider_timeout_seconds)
    if provider == "openai":
        return OpenAIProvider(settings.openai_api_key or "", settings.openai_model, settings.provider_timeout_seconds)
    return DemoProvider()
