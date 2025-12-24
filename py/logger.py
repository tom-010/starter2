import logging
import os
import structlog
from contextlib import asynccontextmanager

is_dev = os.environ.get("ENV", "development") == "development"

# Processors for all logs (app + framework)
base_processors = [
    structlog.processors.TimeStamper(fmt="%H:%M:%S" if is_dev else "iso"),
    structlog.processors.add_log_level,
]

# Extra processors for app logs only (not framework logs)
app_processors = base_processors + [
    structlog.processors.CallsiteParameterAdder(
        [
            structlog.processors.CallsiteParameter.LINENO,
            structlog.processors.CallsiteParameter.FILENAME,
            structlog.processors.CallsiteParameter.FUNC_NAME,
        ],
    ),
]


def setup_logging():
    """Call this after uvicorn has initialized to take over its logging."""
    structlog.configure(
        processors=app_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=base_processors,  # No callsite info for framework logs
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            structlog.dev.ConsoleRenderer() if is_dev else structlog.processors.JSONRenderer(),
        ],
    )

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.DEBUG if is_dev else logging.INFO)

    for name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        logger = logging.getLogger(name)
        logger.handlers.clear()
        logger.propagate = True


setup_logging()

log = structlog.get_logger()

@asynccontextmanager
async def lifespan(app):
    # Re-configure logging after uvicorn has set up its handlers
    setup_logging()
    log.info("server started")
    yield
    log.info("server stopped")