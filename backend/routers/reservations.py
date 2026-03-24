from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timezone
from typing import List
from pydantic import BaseModel, validator
import secrets

from database import get_db
from models.models import Reservation, ParkingSlot, ReservationStatus, SlotStatus
from routers.auth import get_current_user

router = APIRouter(prefix="/reservations", tags=["Reservations"])

# -------------------------------
# Request Model
# -------------------------------
class ReservationCreate(BaseModel):
    slot_id: int
    start_time: datetime
    end_time: datetime

    @validator("start_time", "end_time", pre=True)
    def parse_custom_datetime(cls, value):
        """
        Accept frontend format: 'YYYY-MM-DDTHH:MM' from datetime-local input
        Fallback: ISO format
        """
        if isinstance(value, str):
            try:
                return datetime.strptime(value.strip(), "%Y-%m-%dT%H:%M")
            except ValueError:
                return datetime.fromisoformat(value)
        return value

# -------------------------------
# Response Model
# -------------------------------
class ReservationOut(BaseModel):
    id: int
    slot_id: int
    start_time: datetime
    end_time: datetime
    status: ReservationStatus
    qr_token: str

    class Config:
        from_attributes = True

# -------------------------------
# Helper: ensure UTC timezone
# -------------------------------
def ensure_timezone(dt: datetime):
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt

# -------------------------------
# POST: Book a slot
# -------------------------------
@router.post("/", response_model=ReservationOut, status_code=201)
def book_slot(
    req: ReservationCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    start_time = ensure_timezone(req.start_time)
    end_time = ensure_timezone(req.end_time)
    now = datetime.now(timezone.utc)

    # Validation
    if start_time <= now:
        raise HTTPException(status_code=400, detail="Start time must be in future")
    if end_time <= start_time:
        raise HTTPException(status_code=400, detail="End time must be after start")
    if (end_time - start_time).total_seconds() > 14400:
        raise HTTPException(status_code=400, detail="Max 4 hours booking allowed")

    # Check slot exists
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == req.slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")

    # Check for conflicts
    conflict = db.query(Reservation).filter(
        and_(
            Reservation.slot_id == req.slot_id,
            Reservation.status == ReservationStatus.active,
            Reservation.start_time < end_time,
            Reservation.end_time > start_time
        )
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="Time slot already reserved")

    # Create reservation
    reservation = Reservation(
        user_id=user.id,
        slot_id=req.slot_id,
        start_time=start_time,
        end_time=end_time,
        qr_token=secrets.token_hex(16),
        status=ReservationStatus.active
    )

    # Update slot status
    slot.status = SlotStatus.reserved

    db.add(reservation)
    db.commit()
    db.refresh(reservation)

    return reservation

# -------------------------------
# DELETE: Cancel reservation
# -------------------------------
@router.delete("/{reservation_id}")
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    res = db.query(Reservation).filter(
        Reservation.id == reservation_id,
        Reservation.user_id == user.id
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found or not yours")
    if res.status != ReservationStatus.active:
        raise HTTPException(status_code=400, detail="Cannot cancel this reservation")

    res.status = ReservationStatus.cancelled

    slot = db.query(ParkingSlot).filter(ParkingSlot.id == res.slot_id).first()
    if slot:
        slot.status = SlotStatus.free

    db.commit()
    return {"message": "Cancelled successfully"}

# -------------------------------
# GET: My reservations
# -------------------------------
@router.get("/me", response_model=List[ReservationOut])
def my_reservations(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Reservation).filter(Reservation.user_id == user.id).all()