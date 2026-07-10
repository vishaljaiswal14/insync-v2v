"""GET /schemes — lists available schemes and their source metadata."""

from fastapi import APIRouter

from app.services.rule_loader import list_scheme_ids, load_scheme

router = APIRouter(tags=["schemes"])


@router.get("/schemes")
def list_schemes() -> list[dict]:
    schemes = [load_scheme(scheme_id) for scheme_id in list_scheme_ids()]

    return [
        {
            "scheme_id": scheme.scheme_id,
            "scheme_name": scheme.scheme_name,
            "grant_type": scheme.grant_type,
            "version": scheme.version,
            "last_verified": scheme.last_verified,
            "official_source": scheme.official_source,
            "source_label": scheme.source_label,
            "source_url": scheme.source_url,
        }
        for scheme in schemes
    ]
