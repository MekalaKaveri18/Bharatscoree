from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any, Dict

# ======================================================
# 🔐 AUTH SCHEMAS
# ======================================================

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str  # borrower | lender | admin
    phone: Optional[str] = None   # ✅ Added for frontend field alignment

class VerifyEmailIn(BaseModel):
    email: EmailStr
    code: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class MeOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str


# ======================================================
# 📄 BORROWER DOCUMENTS
# ======================================================

class SaveDocumentIn(BaseModel):
    doc_type: str
    detected_type: Optional[str] = None
    is_valid: Optional[bool] = None
    extracted_json: Dict[str, Any] = Field(default_factory=dict)


# ======================================================
# 🧮 SCORING OUTPUT
# ======================================================

class ScoreOut(BaseModel):
    score: float
    risk_probability: float
    external_id: Optional[str] = None  # ✅ added so you can return borrower's UUID to frontend
