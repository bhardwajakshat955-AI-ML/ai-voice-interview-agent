from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., min_length=1, max_length=4000)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="The recruiter's question")
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)

    @field_validator("message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be blank")
        return v.strip()


class ChatResponse(BaseModel):
    answer: str
    provider: Literal["demo", "gemini", "openai"]
    demo_mode: bool


class HealthResponse(BaseModel):
    status: Literal["ok"]
    app: str
    provider: Literal["demo", "gemini", "openai"]
    demo_mode: bool
    version: str
