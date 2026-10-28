from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.api.routes import router
from app.config import get_settings
from app.services.chat_service import ChatService
from app.services.rate_limit import RateLimiter

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")


def create_app() -> FastAPI:
    settings = get_settings()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.chat_service = ChatService(settings)
        app.state.rate_limiter = RateLimiter(settings.rate_limit_requests, settings.rate_limit_window_seconds)
        logging.getLogger("app").info(
            "Starting %s v%s with provider=%s", settings.app_name, __version__, settings.effective_provider
        )
        yield

    app = FastAPI(
        title=settings.app_name,
        version=__version__,
        docs_url="/docs" if settings.enable_docs else None,
        redoc_url=None,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422, content={"detail": "Invalid request. Send a non-empty message under 1000 characters."}
        )

    @app.exception_handler(Exception)
    async def unhandled_handler(_: Request, exc: Exception) -> JSONResponse:
        logging.getLogger("app").exception("Unhandled error")
        return JSONResponse(status_code=500, content={"detail": "Something went wrong. Please try again."})

    app.include_router(router)

    @app.get("/", include_in_schema=False)
    async def root() -> dict:
        return {"app": settings.app_name, "health": "/api/health", "docs": "/docs" if settings.enable_docs else None}

    return app


app = create_app()
