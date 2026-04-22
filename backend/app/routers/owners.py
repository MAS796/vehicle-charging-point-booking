from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models
from ..database import SessionLocal
from ..dependencies import get_current_admin, get_current_user
from ..schemas import OwnerOut, OwnerRegisterRequest, OwnerSummary
from ..services.auth_service import hash_password

router = APIRouter(tags=["Owners"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _build_owner_summary(owner: models.StationOwner, db: Session) -> OwnerSummary:
    active_stations = 0
    total_bookings = 0
    total_revenue = 0.0

    if owner.company_id:
        active_stations = (
            db.query(func.count(models.ChargingStation.id))
            .filter(models.ChargingStation.company_id == owner.company_id)
            .scalar()
            or 0
        )

        station_ids_query = db.query(models.ChargingStation.id).filter(models.ChargingStation.company_id == owner.company_id)
        bookings_query = db.query(models.Booking.id).filter(
            (models.Booking.company_id == owner.company_id)
            | (models.Booking.station_id.in_(station_ids_query))
        )
        booking_ids = [row[0] for row in bookings_query.all()]
        total_bookings = len(booking_ids)

        if booking_ids:
            paid_amount = (
                db.query(func.sum(models.Payment.amount))
                .filter(
                    models.Payment.booking_id.in_(booking_ids),
                    models.Payment.status.in_(["paid", "captured", "success"]),
                )
                .scalar()
            )
            total_revenue = float(paid_amount or 0.0)

    return OwnerSummary(
        owner=owner,  # type: ignore[arg-type]
        active_stations=int(active_stations),
        bookings=int(total_bookings),
        revenue=float(total_revenue),
    )


@router.post("/register", response_model=OwnerOut)
def register_owner(data: OwnerRegisterRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()

    existing_owner = db.query(models.StationOwner).filter(models.StationOwner.email == email).first()
    if existing_owner:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Owner already exists")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user and db.query(models.StationOwner).filter(models.StationOwner.user_id == user.id).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already registered as owner")

    if not user:
        user = models.User(
            email=email,
            name=data.name,
            phone=data.phone,
            password_hash=hash_password(data.password) if data.password else None,
            is_active=True,
            is_verified=bool(data.password),
            role=models.UserRole.STATION_OWNER.value,
        )
        db.add(user)
        db.flush()
    else:
        user.name = data.name
        user.phone = data.phone
        if data.password:
            user.password_hash = hash_password(data.password)
            user.is_verified = True
        if user.role in (None, "", models.UserRole.USER.value):
            user.role = models.UserRole.STATION_OWNER.value

    owner = models.StationOwner(
        user_id=user.id,
        company_id=data.company_id,
        name=data.name,
        email=email,
        phone=data.phone,
        is_active=True,
    )
    db.add(owner)
    db.commit()
    db.refresh(owner)
    return owner


@router.get("/", response_model=list[OwnerOut])
def list_owners(
    _admin: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    owners = db.query(models.StationOwner).order_by(models.StationOwner.id.desc()).all()
    return owners


@router.get("/me/summary", response_model=OwnerSummary)
def my_owner_summary(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = (current_user.role or "").strip().lower()
    if not current_user.is_admin and role != models.UserRole.STATION_OWNER.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Station owner access required")

    owner = db.query(models.StationOwner).filter(models.StationOwner.user_id == current_user.id).first()
    if not owner:
        owner = db.query(models.StationOwner).filter(models.StationOwner.email == current_user.email).first()

    if not owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Station owner profile not found")

    if owner.user_id is None:
        owner.user_id = current_user.id
        db.commit()
        db.refresh(owner)

    return _build_owner_summary(owner, db)
