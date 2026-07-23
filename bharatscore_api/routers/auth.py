import uuid
import re
import secrets
import string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User, UserRole, Borrower
from ..schemas import UserRegister, UserLogin, TokenOut, MeOut
from ..security import hash_password, verify_password, create_access_token
from ..deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


# ======================================================
# 🔐 Helpers
# ======================================================

def strong_password(pwd: str) -> bool:
    """Check for 8+ chars, 1 upper, 1 lower, 1 digit, 1 special."""
    return (
        len(pwd) >= 8
        and re.search(r"[a-z]", pwd)
        and re.search(r"[A-Z]", pwd)
        and re.search(r"[0-9]", pwd)
        and re.search(r"[^\w\s]", pwd)
    )


def _mk_external_id() -> str:
    """Generate borrower external ID like BS-4G7X9LQ2."""
    s = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    return f"BS-{s}"


# ======================================================
# 🧍‍♂️ Register User
# ======================================================

@router.post("/register")
def register(data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Validates password strength.
    - Ensures unique email.
    - Auto-creates Borrower record if role == 'borrower'.
    - Skips email verification (demo only).
    """

    # Role validation
    if data.role not in ("borrower", "lender", "admin"):
        raise HTTPException(status_code=400, detail="Role must be one of borrower | lender | admin")

    # Password strength
    if not strong_password(data.password):
        raise HTTPException(status_code=400, detail="Weak password: must be 8+ chars with upper, lower, digit, and symbol.")

    # Duplicate email check
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = User(
        id=uuid.uuid4(),
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        phone=data.phone,  # ✅ new optional field
        role=UserRole(data.role),
        is_verified=True,  # Skipped email verification for demo
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Auto-create borrower record if user is a borrower
    if user.role.value == "borrower":
        borrower = Borrower(
            user_id=user.id,
            external_id=_mk_external_id()
        )
        db.add(borrower)
        db.commit()

    print(f"[INFO] ✅ Account created for {user.email}")

    # ✅ Return structured response
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role.value,
        "phone": user.phone,
        "message": "Registered successfully (email verification skipped)"
    }


# ======================================================
# 🔑 Login
# ======================================================

@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return JWT access token."""
    user = db.query(User).filter(User.email == data.email.lower()).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=401, detail="Email not verified")

    token = create_access_token(str(user.id), user.role.value)
    return TokenOut(access_token=token, role=user.role.value)


# ======================================================
# 👤 Get current user (profile)
# ======================================================

@router.get("/me", response_model=MeOut)
def me(current_user: User = Depends(get_current_user)):
    """Return details of the currently authenticated user."""
    return MeOut(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role.value,
        phone=current_user.phone  # ✅ include phone in /me response
    )
