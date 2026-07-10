"""FastAPI application entrypoint.

Run locally with:
    uvicorn app.main:app --reload
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging_config import setup_logging
from app.services.rule_loader import SchemeNotFoundError, validate_all_schemes

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Fail fast: a malformed scheme JSON should crash startup, not a live request.
    try:
        validate_all_schemes()
    except Exception:
        logger.exception("Startup validation failed — refusing to start")
        raise
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.exception_handler(SchemeNotFoundError)
async def scheme_not_found_handler(request: Request, exc: SchemeNotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Catch-all so an unexpected error never leaks a stack trace to the client.
    # Feature-specific errors get their own handlers above, like SchemeNotFoundError.
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/")
def root() -> dict[str, str]:
    return {"message": f"{settings.app_name} API. See {settings.api_v1_prefix}/health."}
