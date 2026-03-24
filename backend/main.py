from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
from models.models import ParkingSlot, SlotStatus
from routers import auth, slots, reservations, predictions

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Vel Tech Smart Parking API",
    description="AI-powered parking management system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,prefix="/auth",         tags=["Authentication"])
app.include_router(slots.router)
app.include_router(reservations.router)
app.include_router(predictions.router)

@app.on_event("startup")
def seed_slots():
    db = SessionLocal()
    try:
        if db.query(ParkingSlot).count() == 0:
            for i in range(1, 51):
                db.add(ParkingSlot(
                    slot_number=i,
                    floor=1 if i <= 25 else 2,
                    status=SlotStatus.free
                ))
            db.commit()
            print("Created initial 50 parking slots")
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Vel Tech Smart Parking API", "docs": "/docs"}