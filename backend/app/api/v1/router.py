"""Collects every v1 route module into a single router.

New feature routers (schemes, scoring, roadmap...) get one `include_router`
line here as they are built.
"""

from fastapi import APIRouter

from app.api.v1.routes import health

api_router = APIRouter()
api_router.include_router(health.router)
