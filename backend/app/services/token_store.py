from __future__ import annotations

from datetime import datetime, timedelta
import os
from typing import Dict, Tuple


class _InMemoryTokenStore:
    def __init__(self) -> None:
        self._data: Dict[str, datetime] = {}

    def _cleanup(self) -> None:
        now = datetime.utcnow()
        stale = [k for k, exp in self._data.items() if exp <= now]
        for k in stale:
            self._data.pop(k, None)

    def setex(self, key: str, ttl_seconds: int, _value: str = "1") -> None:
        self._cleanup()
        self._data[key] = datetime.utcnow() + timedelta(seconds=ttl_seconds)

    def exists(self, key: str) -> bool:
        self._cleanup()
        return key in self._data

    def delete(self, key: str) -> None:
        self._cleanup()
        self._data.pop(key, None)

    def delete_prefix(self, prefix: str) -> None:
        self._cleanup()
        for key in [k for k in self._data.keys() if k.startswith(prefix)]:
            self._data.pop(key, None)


class TokenStore:
    def __init__(self) -> None:
        self._redis = None
        self._memory = _InMemoryTokenStore()
        redis_url = os.getenv("REDIS_URL", "").strip()
        if redis_url:
            try:
                import redis  # type: ignore

                self._redis = redis.Redis.from_url(redis_url, decode_responses=True)
                self._redis.ping()
            except Exception:
                self._redis = None

    def _setex(self, key: str, ttl_seconds: int, value: str = "1") -> None:
        if self._redis is not None:
            self._redis.setex(key, ttl_seconds, value)
            return
        self._memory.setex(key, ttl_seconds, value)

    def _exists(self, key: str) -> bool:
        if self._redis is not None:
            return bool(self._redis.exists(key))
        return self._memory.exists(key)

    def _delete(self, key: str) -> None:
        if self._redis is not None:
            self._redis.delete(key)
            return
        self._memory.delete(key)

    def _delete_prefix(self, prefix: str) -> None:
        if self._redis is not None:
            cursor = 0
            pattern = f"{prefix}*"
            while True:
                cursor, keys = self._redis.scan(cursor=cursor, match=pattern, count=100)
                if keys:
                    self._redis.delete(*keys)
                if cursor == 0:
                    break
            return
        self._memory.delete_prefix(prefix)

    @staticmethod
    def _access_key(user_id: int, device_id: str, jti: str) -> str:
        return f"access:{user_id}:{device_id}:{jti}"

    @staticmethod
    def _refresh_key(user_id: int, device_id: str, refresh_token: str) -> str:
        return f"refresh:{user_id}:{device_id}:{refresh_token}"

    def store_access_token(self, user_id: int, device_id: str, jti: str, ttl_seconds: int) -> None:
        self._setex(self._access_key(user_id, device_id, jti), ttl_seconds, "1")

    def is_access_token_valid(self, user_id: int, device_id: str, jti: str) -> bool:
        return self._exists(self._access_key(user_id, device_id, jti))

    def revoke_device_access_tokens(self, user_id: int, device_id: str) -> None:
        self._delete_prefix(f"access:{user_id}:{device_id}:")

    def store_refresh_token(self, user_id: int, device_id: str, refresh_token: str, ttl_seconds: int) -> None:
        self._setex(self._refresh_key(user_id, device_id, refresh_token), ttl_seconds, "1")

    def is_refresh_token_valid(self, user_id: int, device_id: str, refresh_token: str) -> bool:
        return self._exists(self._refresh_key(user_id, device_id, refresh_token))

    def revoke_refresh_token(self, user_id: int, device_id: str, refresh_token: str) -> None:
        self._delete(self._refresh_key(user_id, device_id, refresh_token))


token_store = TokenStore()

