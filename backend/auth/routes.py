import hashlib

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import SessionLocal
from models.user import User
from schemas.user import RegisterRequest, LoginRequest

router = APIRouter()


ALLOWED_ROLES = {"user", "admin"}


def _hash_password(password: str) -> str:
    digest = hashlib.sha256(password.encode("utf-8")).hexdigest()
    return f"sha256${digest}"


def _verify_password(raw_password: str, stored_password: str) -> bool:
    # Backward compatibility for existing plaintext rows.
    if stored_password.startswith("sha256$"):
        return stored_password == _hash_password(raw_password)
    return stored_password == raw_password


def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):

    username = data.username.strip()
    role = data.role.strip().lower()

    if role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'user' or 'admin'"
        )

    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is required"
        )

    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )

    user = User(
        username=username,
        password=_hash_password(data.password),
        role=role
    )

    try:
        db.add(user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )

    return {
        "message": "User registered successfully",
        "role": role
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    username = data.username.strip()

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not _verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    return {
        "message": "Login success",
        "username": user.username,
        "role": user.role
    }