from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List
from pydantic import BaseModel
import random

from database import get_db
from models.models import ParkingSlot, SlotStatus

router = APIRouter(prefix="/predict", tags=["Predictions"])

class VacancyItem(BaseModel):
    time: str
    predicted_free_slots: int

class VacancyOut(BaseModel):
    current_free: int
    total_slots: int
    predictions: List[VacancyItem]

@router.get("/vacancy", response_model=VacancyOut)
def predict_vacancy(hours: int = Query(6, ge=1, le=24), db: Session = Depends(get_db)):
    total = db.query(ParkingSlot).count() or 50
    current_free = db.query(ParkingSlot).filter(ParkingSlot.status == SlotStatus.free).count()

    now = datetime.now(timezone.utc)
    predictions = []

    for i in range(hours):
        t = now + timedelta(hours=i+1)
        h = t.hour

        if 8 <= h <= 10 or 17 <= h <= 19:
            free = int(total * random.uniform(0.05, 0.25))
        elif 12 <= h <= 14:
            free = int(total * random.uniform(0.20, 0.45))
        elif h >= 22 or h <= 5:
            free = int(total * random.uniform(0.70, 0.95))
        else:
            free = int(total * random.uniform(0.30, 0.65))

        predictions.append({
            "time": t.strftime("%I:%M %p"),
            "predicted_free_slots": max(0, free)
        })

    return {
        "current_free": current_free,
        "total_slots": total,
        "predictions": predictions
    }

class ArrivalItem(BaseModel):
    hour: str
    predicted_arrivals: int

@router.get("/arrival", response_model=List[ArrivalItem])
def predict_arrivals(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    predictions = []

    pattern = {
        7: 6, 8: 14, 9: 18, 10: 15, 11: 12,
        12: 10, 13: 8, 14: 7, 15: 9, 16: 14,
        17: 20, 18: 16, 19: 12, 20: 8, 21: 5
    }

    for i in range(12):
        future = (now + timedelta(hours=i)).hour
        base = pattern.get(future, 5)
        arrivals = max(0, base + random.randint(-3, 4))
        predictions.append({
            "hour": f"{future:02d}:00",
            "predicted_arrivals": arrivals
        })

    return predictions