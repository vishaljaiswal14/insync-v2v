"""One place to configure logging.

Called once at startup so every module can just do `logging.getLogger(__name__)`
and get consistent, readable output.
"""

import logging

from app.core.config import settings

_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"


def setup_logging() -> None:
    logging.basicConfig(
        level=settings.log_level.upper(),
        format=_LOG_FORMAT,
        datefmt="%H:%M:%S",
    )
