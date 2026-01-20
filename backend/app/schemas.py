from pydantic import BaseModel

class StationCreate(BaseModel):
    name: str
    address: str
    lat: float
    lon: float

class StationOut(StationCreate):
    id: int
    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    station_id: int
    name: str
    car_number: str
    phone: str
    hours: int

class BookingOut(BookingCreate):
    id: int
    status: str
    class Config:
        from_attributes = True


class PaymentCreate(BaseModel):
    booking_id: int
    amount: int

class PaymentOut(PaymentCreate):
    id: int
    class Config:
        from_attributes = True
