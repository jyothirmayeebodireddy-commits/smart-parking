import random
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from database import SessionLocal, Base, engine
from models.models import ParkingSlot, OccupancyHistory, SlotStatus

Base.metadata.create_all(bind=engine)

db = SessionLocal()

IST = ZoneInfo("Asia/Kolkata")

# Create slots if missing
if db.query(ParkingSlot).count() == 0:
    for i in range(1, 51):
        db.add(ParkingSlot(slot_number=i, floor=1 if i <= 25 else 2, status=SlotStatus.free))
    db.commit()
    print("Created 50 slots")

slots = db.query(ParkingSlot).all()

now_ist = datetime.now(IST)
start = (now_ist - timedelta(days=30)).replace(hour=0, minute=0, second=0, microsecond=0)

print("Generating 30 days of fake history...")

for day in range(30):
    for hour in range(24):
        ts = start + timedelta(days=day, hours=hour)
        h = ts.hour
        weekday = ts.weekday() < 5

        if weekday:
            if 8 <= h <= 10 or 17 <= h <= 19: rate = random.uniform(0.80, 0.95)
            elif 12 <= h <= 14: rate = random.uniform(0.60, 0.80)
            elif h >= 22 or h <= 5: rate = random.uniform(0.05, 0.20)
            else: rate = random.uniform(0.35, 0.65)
        else:
            rate = random.uniform(0.15, 0.45) if 9 <= h <= 21 else random.uniform(0.05, 0.25)

        for slot in slots:
            status = SlotStatus.occupied if random.random() < rate else SlotStatus.free
            db.add(OccupancyHistory(slot_id=slot.id, timestamp=ts, status=status))

    db.commit()
    print(f"Day {day+1}/30 done")

db.close()
print("Fake data generation complete.")