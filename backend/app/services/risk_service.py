from __future__ import annotations

from sqlalchemy.orm import Session

from .. import models


def calculate_request_risk_score(
    *,
    db: Session,
    user_id: int,
    current_ip: str | None,
    device_id: str | None,
    user_agent: str | None,
) -> int:
    """
    Lightweight continuous risk scoring.
    0-100 scale where > threshold should be blocked.
    """
    score = 0

    # Compare with most recent login IP
    last_login = (
        db.query(models.LoginHistory)
        .filter(models.LoginHistory.user_id == user_id)
        .order_by(models.LoginHistory.timestamp.desc())
        .first()
    )
    if last_login and current_ip and last_login.ip_address and last_login.ip_address != current_ip:
        score += 35

    # Device binding risk
    if device_id:
        device = (
            db.query(models.UserDevice)
            .filter(models.UserDevice.user_id == user_id, models.UserDevice.device_id == device_id)
            .first()
        )
        if not device:
            score += 40
        else:
            if current_ip and device.last_ip and device.last_ip != current_ip:
                score += 20
            if user_agent and device.user_agent and device.user_agent != user_agent:
                score += 15
    else:
        score += 50

    return min(score, 100)

