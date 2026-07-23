from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from .security import decode_token
from .db import get_db
from .models import User

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1].strip()
    try:
        data = decode_token(token)
    except Exception:
        raise HTTPException(401, "Invalid token")

    uid = data.get("sub")
    if not uid:
        raise HTTPException(401, "Invalid token payload")

    user = db.get(User, uid)
    if not user:
        raise HTTPException(401, "User not found")
    return user
