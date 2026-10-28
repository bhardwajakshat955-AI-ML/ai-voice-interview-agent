from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from app import __version__
from app.config import Settings, get_settings
from app.knowledge.candidate_profile import public_profile
from app.models.schemas import ChatRequest, ChatResponse, HealthResponse
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api")


def get_chat_service(request: Request) -> ChatService:
    return request.app.state.chat_service


@router.get("/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    provider = settings.effective_provider
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        provider=provider,
        demo_mode=provider == "demo",
        version=__version__,
    )


@router.get("/profile")
async def profile() -> dict:
    return public_profile()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    request: Request,
    settings: Settings = Depends(get_settings),
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    if len(payload.message) > settings.max_message_chars:
        raise HTTPException(status_code=413, detail="Message is too long.")
    client_ip = request.client.host if request.client else "unknown"
    if not request.app.state.rate_limiter.allow(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment.")
    return await service.answer(payload.message, payload.history)
