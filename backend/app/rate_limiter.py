"""
Rate limiter abstraction.
Uses slowapi when available; falls back to a no-op limiter so app can still run.
"""

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    from slowapi import _rate_limit_exceeded_handler
    from slowapi.middleware import SlowAPIMiddleware

    limiter = Limiter(key_func=get_remote_address)
    HAS_SLOWAPI = True
except Exception:
    class _NoopLimiter:
        def limit(self, _spec: str):
            def _decorator(func):
                return func
            return _decorator

    limiter = _NoopLimiter()
    RateLimitExceeded = Exception
    _rate_limit_exceeded_handler = None
    SlowAPIMiddleware = None
    HAS_SLOWAPI = False
