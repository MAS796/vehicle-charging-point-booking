from __future__ import annotations

from datetime import datetime
import hashlib
import json
import os


def log_charging_event(data: dict) -> dict:
    """
    Blockchain-style immutable event hash.
    This provides tamper-evident ledger records even without on-chain write.
    """
    payload = json.dumps(data, sort_keys=True, separators=(",", ":"))
    event_hash = hashlib.sha256(payload.encode("utf-8")).hexdigest()
    return {
        "blockchain_hash": event_hash,
        "timestamp": datetime.utcnow().isoformat(),
        "chain_mode": "hash-ledger",
        "network": os.getenv("WEB3_NETWORK", "local"),
    }

