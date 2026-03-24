from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class SlotStatus(str, enum.Enum):
    free     = "free"
    occupied = "occupied"
    reserved = "reserved"

class ReservationStatus(str, enum.Enum):
    active    = "active"
    cancelled = "cancelled"
    expired   = "expired"
    completed = "completed"

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String, nullable=False)
    email           = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin        = Column(Boolean, default=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
    reservations    = relationship("Reservation", back_populates="user")

class ParkingSlot(Base):
    __tablename__ = "parking_slots"
    id           = Column(Integer, primary_key=True, index=True)
    slot_number  = Column(Integer, nullable=False)
    floor        = Column(Integer, default=1)
    status       = Column(Enum(SlotStatus), default=SlotStatus.free)
    reservations = relationship("Reservation", back_populates="slot")

class Reservation(Base):
    __tablename__ = "reservations"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    slot_id    = Column(Integer, ForeignKey("parking_slots.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time   = Column(DateTime, nullable=False)
    status     = Column(Enum(ReservationStatus), default=ReservationStatus.active)
    qr_token   = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user       = relationship("User", back_populates="reservations")
    slot       = relationship("ParkingSlot", back_populates="reservations")

class OccupancyHistory(Base):
    __tablename__ = "occupancy_history"
    id        = Column(Integer, primary_key=True, index=True)
    slot_id   = Column(Integer, ForeignKey("parking_slots.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    status    = Column(Enum(SlotStatus), nullable=False)