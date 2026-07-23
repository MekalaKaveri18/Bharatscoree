import uuid
import enum
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, Enum, Integer, Numeric,
    ForeignKey, Text
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from .db import Base  # ✅ correct import


# ============================================================
# ENUMS
# ============================================================
class UserRole(str, enum.Enum):
    borrower = "borrower"
    lender = "lender"
    admin = "admin"


# ============================================================
# USERS
# ============================================================
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)  # ✅ added phone
    role = Column(Enum(UserRole, name="user_role"), nullable=False)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    borrower = relationship("Borrower", back_populates="user", uselist=False, cascade="all,delete-orphan")


# ============================================================
# BORROWERS
# ============================================================
class Borrower(Base):
    __tablename__ = "borrowers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    external_id = Column(String, unique=True, nullable=False)

    age = Column(Integer)
    occupation = Column(String)
    annual_income = Column(Numeric(12, 2))
    monthly_inhand_salary = Column(Numeric(12, 2))
    monthly_balance = Column(Numeric(12, 2))
    amount_invested_monthly = Column(Numeric(12, 2))
    num_bank_accounts = Column(Integer)
    num_credit_card = Column(Integer)
    num_of_loan = Column(Integer)
    type_of_loan = Column(String)
    interest_rate = Column(Numeric(5, 2))
    total_emi_per_month = Column(Numeric(12, 2))
    total_debt = Column(Numeric(12, 2))
    delay_from_due_date = Column(Integer)
    num_of_delayed_payment = Column(Integer)
    total_assets = Column(Numeric(12, 2))
    debt_to_asset_ratio = Column(Numeric(5, 2))
    asset_to_income_ratio = Column(Numeric(5, 2))
    networth_to_totalassets_ratio = Column(Numeric(5, 2))

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="borrower")
    documents = relationship("BorrowerDocument", back_populates="borrower", cascade="all,delete-orphan")
    score = relationship("BorrowerScore", back_populates="borrower", uselist=False, cascade="all,delete-orphan")
    lender_decisions = relationship("LenderDecision", back_populates="borrower", cascade="all,delete-orphan")


# ============================================================
# BORROWER DOCUMENTS
# ============================================================
class BorrowerDocument(Base):
    __tablename__ = "borrower_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("borrowers.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String, nullable=False)  # AADHAAR | PAN | BANK_STATEMENT etc.
    detected_type = Column(String)
    is_valid = Column(Boolean)
    extracted_json = Column(JSONB)
    file_path = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    borrower = relationship("Borrower", back_populates="documents")


# ============================================================
# BORROWER SCORES
# ============================================================
class BorrowerScore(Base):
    __tablename__ = "borrower_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("borrowers.id", ondelete="CASCADE"), nullable=False)
    score = Column(Numeric(5, 2))
    risk_probability = Column(Numeric(5, 4))
    last_scored_at = Column(DateTime, default=datetime.utcnow)

    borrower = relationship("Borrower", back_populates="score")


# ============================================================
# LENDER DECISIONS
# ============================================================
class LenderDecision(Base):
    __tablename__ = "lender_decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    borrower_id = Column(UUID(as_uuid=True), ForeignKey("borrowers.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False)  # approved | rejected | pending
    notes = Column(Text)
    decided_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    borrower = relationship("Borrower", back_populates="lender_decisions")


# ============================================================
# APP METRICS (Admin dashboard)
# ============================================================
class AppMetric(Base):
    __tablename__ = "app_metrics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ts = Column(DateTime, default=datetime.utcnow)
    active_users = Column(Integer)
    total_borrowers = Column(Integer)
    borrowers_scored = Column(Integer)
    avg_bharatscore = Column(Numeric(5, 2))
    high_risk_rate = Column(Numeric(5, 2))
