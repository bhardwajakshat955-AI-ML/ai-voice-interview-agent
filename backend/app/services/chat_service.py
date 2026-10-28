from __future__ import annotations

import logging

from app.config import Settings
from app.models.schemas import ChatMessage, ChatResponse
from app.services.demo_provider import demo_answer
from app.services.llm_providers import BaseProvider, ProviderError, build_provider
from app.services.prompts import build_system_prompt

log = logging.getLogger(__name__)


class ChatService:
    def __init__(self, settings: Settings, provider: BaseProvider | None = None):
        self.settings = settings
        self.provider = provider or build_provider(settings)
        self.system_prompt = build_system_prompt()

    def _trim_history(self, history: list[ChatMessage]) -> list[dict]:
        trimmed = history[-self.settings.max_history_messages :]
        return [{"role": m.role, "content": m.content[: self.settings.max_message_chars]} for m in trimmed]

    async def answer(self, message: str, history: list[ChatMessage]) -> ChatResponse:
        trimmed = self._trim_history(history)
        demo = self.provider.name == "demo"
        try:
            text = await self.provider.complete(self.system_prompt, trimmed, message)
        except ProviderError:
            # Degrade gracefully: give the recruiter a verified demo answer instead of an error page.
            log.warning("Provider %s failed; falling back to demo answer", self.provider.name)
            text = demo_answer(message, trimmed)
            return ChatResponse(answer=text, provider="demo", demo_mode=True)
        if not text:
            text = demo_answer(message, trimmed)
            demo = True
        return ChatResponse(answer=text, provider="demo" if demo else self.provider.name, demo_mode=demo)
