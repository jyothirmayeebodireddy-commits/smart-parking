from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from database import get_db
from models.models import User
import hashlib
import os

router        = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SECRET_KEY    = os.getenv("SECRET_KEY", "veltech-smart-parking-secret-key-2024")
ALGORITHM     = "HS256"

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed

def create_token(data: dict, expires_minutes: int = 120):
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    return jwt.encode({**data, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email   = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register", status_code=201)
def register(
    name:     str,
    email:    str,
    password: str,
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name            = name,
        email           = email,
        hashed_password = hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "id":      user.id,
        "name":    user.name,
        "email":   user.email,
        "message": "Account created successfully!"
    }

@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db:   Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    token = create_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type":   "bearer",
        "user_name":    user.name,
        "user_email":   user.email
    }