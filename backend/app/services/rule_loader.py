"""Loads scheme rule configs from JSON into typed, validated Scheme objects.

Schemes are data, not code. Adding or changing a scheme means editing a JSON
file under data/schemes/ — this loader and the engine never change.
"""

import json
import logging
import time
from pathlib import Path

from app.schemas.scheme import Scheme

logger = logging.getLogger(__name__)

SCHEMES_DIR = Path(__file__).resolve().parents[3] / "data" / "schemes"


class SchemeNotFoundError(Exception):
    def __init__(self, scheme_id: str):
        super().__init__(f"Unknown scheme: '{scheme_id}'")
        self.scheme_id = scheme_id


def load_scheme(scheme_id: str) -> Scheme:
    path = SCHEMES_DIR / f"{scheme_id}.json"
    if not path.exists():
        raise SchemeNotFoundError(scheme_id)

    raw = json.loads(path.read_text())
    return Scheme.model_validate(raw)


def list_scheme_ids() -> list[str]:
    return sorted(path.stem for path in SCHEMES_DIR.glob("*.json"))


def validate_all_schemes() -> list[Scheme]:
    """Loads and validates every scheme JSON. Called at app startup so a
    malformed scheme fails the boot, not a live request."""
    started = time.perf_counter()

    schemes = [load_scheme(scheme_id) for scheme_id in list_scheme_ids()]
    for scheme in schemes:
        logger.info(
            "Scheme loaded: %s (v%s, %d criteria)",
            scheme.scheme_id, scheme.version, len(scheme.criteria),
        )

    elapsed_ms = (time.perf_counter() - started) * 1000
    logger.info("Startup validation complete: %d scheme(s) in %.1fms", len(schemes), elapsed_ms)
    return schemes
