from datetime import datetime
from sqlalchemy.orm import Session

from . import models
from .services.admin_risk_engine import calculate_admin_risk_score
from .websocket_manager import publish_audit_event


def log_action(
    db: Session,
    admin_id: int,
    action: str,
    target_user_id: int | None = None,
    ip_address: str | None = None,
):
    log = models.AuditLog(
        admin_id=admin_id,
        action=action,
        target_user_id=target_user_id,
        ip_address=ip_address or "unknown",
        timestamp=datetime.utcnow(),
    )
    db.add(log)
    db.flush()

    # Update risk score on the admin user record
    admin = db.query(models.User).filter(models.User.id == admin_id).first()
    if admin:
        score, is_anomalous = calculate_admin_risk_score(db=db, admin_id=admin_id)
        admin.risk_score = score

        # If anomalous, add an additional audit signal (without recursion).
        if is_anomalous and action != "SUSPICIOUS_BEHAVIOR_DETECTED":
            alert = models.AuditLog(
                admin_id=admin_id,
                action="SUSPICIOUS_BEHAVIOR_DETECTED",
                target_user_id=target_user_id,
                ip_address=ip_address or "unknown",
                timestamp=datetime.utcnow(),
            )
            db.add(alert)
            db.flush()
            publish_audit_event(
                {
                    "id": alert.id,
                    "admin_id": alert.admin_id,
                    "action": alert.action,
                    "target_user_id": alert.target_user_id,
                    "ip_address": alert.ip_address,
                    "timestamp": alert.timestamp.isoformat(),
                }
            )

    publish_audit_event(
        {
            "id": log.id,
            "admin_id": log.admin_id,
            "action": log.action,
            "target_user_id": log.target_user_id,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
    )
