from __future__ import annotations

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models


def calculate_admin_risk_score(*, db: Session, admin_id: int) -> tuple[int, bool]:
    """
    Basic enterprise-safe scoring (0-100). Also returns `is_anomalous`.
    This is intentionally lightweight and deterministic; you can replace
    internals with ML later without changing API contracts.
    """
    now = datetime.utcnow()
    since_24h = now - timedelta(hours=24)
    since_1h = now - timedelta(hours=1)

    q_24h = db.query(models.AuditLog).filter(
        models.AuditLog.admin_id == admin_id,
        models.AuditLog.timestamp >= since_24h,
    )
    q_1h = db.query(models.AuditLog).filter(
        models.AuditLog.admin_id == admin_id,
        models.AuditLog.timestamp >= since_1h,
    )

    total_24h = q_24h.count()
    total_1h = q_1h.count()

    deletes_24h = q_24h.filter(models.AuditLog.action.ilike("%delete%")).count()
    perm_changes_24h = q_24h.filter(models.AuditLog.action.ilike("%permission%")).count()
    role_changes_24h = q_24h.filter(models.AuditLog.action.ilike("%promote%")).count()

    score = 0
    score += min(total_1h, 60)  # activity volume
    score += min(deletes_24h * 10, 40)
    score += min(perm_changes_24h * 5, 25)
    score += min(role_changes_24h * 5, 20)

    # Off-hours activity (simple heuristic: 00:00-05:00 UTC)
    off_hours = (
        db.query(func.count(models.AuditLog.id))
        .filter(
            models.AuditLog.admin_id == admin_id,
            models.AuditLog.timestamp >= since_24h,
            func.strftime("%H", models.AuditLog.timestamp).cast(models.Integer).between(0, 5),
        )
        .scalar()
        if db.bind and db.bind.dialect.name == "sqlite"
        else None
    )
    if off_hours and off_hours > 0:
        score += 10

    score = min(score, 100)

    # Anomaly heuristic (replaceable with ML)
    is_anomalous = (deletes_24h >= 3 and total_1h >= 20) or score >= 80
    return score, is_anomalous

