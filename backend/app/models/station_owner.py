from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float
from app.database import Base
from app.utils.datetime_utils import utc_now


class StationOwner(Base):
    __tablename__ = "station_owners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    total_revenue = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utc_now)
