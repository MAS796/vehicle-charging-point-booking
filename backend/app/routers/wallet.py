from __future__ import annotations

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import models
from ..database import SessionLocal
from ..dependencies import get_current_user
from ..permission_guard import require_permission
from ..zero_trust import zero_trust_guard

router = APIRouter(prefix="/wallet", tags=["Wallet"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class WalletCreditRequest(BaseModel):
    user_id: int
    amount: int


@router.get("/me")
def wallet_me(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = models.Wallet(user_id=current_user.id, balance=0, updated_at=datetime.utcnow())
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return {"user_id": current_user.id, "balance": int(wallet.balance or 0)}


@router.post("/credit")
def wallet_credit(
    data: WalletCreditRequest,
    request: Request,
    _admin: models.User = Depends(require_permission("manage_users")),
    _zt: bool = Depends(zero_trust_guard),
    db: Session = Depends(get_db),
):
    if data.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid amount")
    user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    wallet = db.query(models.Wallet).filter(models.Wallet.user_id == user.id).first()
    if not wallet:
        wallet = models.Wallet(user_id=user.id, balance=0)
        db.add(wallet)
        db.flush()

    wallet.balance = int(wallet.balance or 0) + int(data.amount)
    wallet.updated_at = datetime.utcnow()
    db.commit()
    return {"status": "credited", "user_id": user.id, "balance": int(wallet.balance)}

