from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
import random
from datetime import datetime, timezone

from database import get_db
from models.models import ParkingSlot, SlotStatus

router = APIRouter(prefix="/slots", tags=["Parking Slots"])

class SlotOut(BaseModel):
    id: int
    slot_number: int
    floor: int
    status: SlotStatus

    class Config:
        from_attributes = True

class SlotUpdate(BaseModel):
    status: SlotStatus

class SimulationResult(BaseModel):
    message: str
    total_slots: int
    free: int
    occupied: int
    reserved: int

@router.get("/", response_model=List[SlotOut])
def get_all_slots(db: Session = Depends(get_db)):
    return db.query(ParkingSlot).order_by(ParkingSlot.floor, ParkingSlot.slot_number).all()

@router.get("/{slot_id}", response_model=SlotOut)
def get_slot(slot_id: int, db: Session = Depends(get_db)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(404, "Slot not found")
    return slot

@router.post("/{slot_id}/status", response_model=SlotOut)
def update_status(slot_id: int, data: SlotUpdate, db: Session = Depends(get_db)):
    slot = db.query(ParkingSlot).filter(ParkingSlot.id == slot_id).first()
    if not slot:
        raise HTTPException(404, "Slot not found")
    slot.status = data.status
    db.commit()
    db.refresh(slot)
    return slot

@router.post("/simulate", response_model=SimulationResult)
def simulate(db: Session = Depends(get_db)):
    slots = db.query(ParkingSlot).all()
    if not slots:
        raise HTTPException(400, "No slots found")

    statuses = [SlotStatus.free, SlotStatus.occupied, SlotStatus.reserved]
    weights = [50, 40, 10]  # example weights

    for slot in slots:
        slot.status = random.choices(statuses, weights=weights, k=1)[0]

    db.commit()

    free = sum(1 for s in slots if s.status == SlotStatus.free)
    occupied = sum(1 for s in slots if s.status == SlotStatus.occupied)
    reserved = sum(1 for s in slots if s.status == SlotStatus.reserved)

    return {
        "message": "Simulation updated",
        "total_slots": len(slots),
        "free": free,
        "occupied": occupied,
        "reserved": reserved
    }