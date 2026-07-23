from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import json

from ..db import get_db
from ..models import Borrower, BorrowerScore, BorrowerDocument
from ..deps import get_current_user
from ..schemas import SaveDocumentIn, ScoreOut
from ..routers.scoring import score_borrower  # reuse scoring logic

router = APIRouter(prefix="/borrowers", tags=["borrowers"])

# ----------------------------------------------------------------------
# Borrower GET by user
# ----------------------------------------------------------------------
@router.get("/by_user")
def get_borrower_by_user(
    db: Session = Depends(get_db),
    current=Depends(get_current_user)
):
    borrower = db.query(Borrower).filter(Borrower.user_id == current.id).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found for this user.")
    return {"external_id": borrower.external_id}


# ----------------------------------------------------------------------
# Borrower GET by external_id
# ----------------------------------------------------------------------
@router.get("/{external_id}")
def get_borrower(external_id: str, db: Session = Depends(get_db)):
    b = db.query(Borrower).filter(Borrower.external_id == external_id).one_or_none()
    if not b:
        return {"exists": False}

    score = db.query(BorrowerScore).filter(BorrowerScore.borrower_id == b.id).one_or_none()
    return {
        "exists": True,
        "external_id": b.external_id,
        "profile": {
            "Age": b.age,
            "Occupation": b.occupation,
            "Annual_Income": str(b.annual_income) if b.annual_income else None,
            "Monthly_Inhand_Salary": str(b.monthly_inhand_salary) if b.monthly_inhand_salary else None,
            "Monthly_Balance": b.monthly_balance,
            "Amount_invested_monthly": b.amount_invested_monthly,
            "Num_Bank_Accounts": b.num_bank_accounts,
            "Num_Credit_Card": b.num_credit_card,
            "Num_of_Loan": b.num_of_loan,
            "Type_of_Loan": b.type_of_loan,
            "Interest_Rate": str(b.interest_rate) if b.interest_rate else None,
            "Total_EMI_per_month": str(b.total_emi_per_month) if b.total_emi_per_month else None,
            "Total_Debt": str(b.total_debt) if b.total_debt else None,
            "Delay_from_due_date": b.delay_from_due_date,
            "Num_of_Delayed_Payment": b.num_of_delayed_payment,
            "Total_Assets": str(b.total_assets) if b.total_assets else None,
            "Debt_to_Asset_Ratio": str(b.debt_to_asset_ratio) if b.debt_to_asset_ratio else None,
            "Asset_to_Income_Ratio": str(b.asset_to_income_ratio) if b.asset_to_income_ratio else None,
            "NetWorth_to_TotalAssets_Ratio": str(b.networth_to_totalassets_ratio) if b.networth_to_totalassets_ratio else None,
        },
        "score": {
            "value": float(score.score) if score else None,
            "risk_probability": float(score.risk_probability) if score else None,
            "last_scored_at": score.last_scored_at.isoformat() if score and score.last_scored_at else None,
        },
    }


# ----------------------------------------------------------------------
# Upload document
# ----------------------------------------------------------------------
@router.post("/{external_id}/upload")
def upload_document(
    external_id: str,
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    borrower = db.query(Borrower).filter(Borrower.external_id == external_id).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found")

    allowed_types = ["bank_statement", "loan_statement", "salary_slip", "asset_doc", "utility_bill", "aadhaar", "pan"]
    if doc_type not in allowed_types:
        raise HTTPException(400, f"Invalid document type. Must be one of: {allowed_types}")

    new_doc = BorrowerDocument(
        borrower_id=borrower.id,
        doc_type=doc_type,
        detected_type=doc_type.upper(),
        is_valid=True,
        extracted_json={"filename": file.filename},
    )

    db.add(new_doc)
    db.commit()
    return {"message": f"File '{file.filename}' uploaded successfully."}


# ----------------------------------------------------------------------
# Save borrower profile (with safe conversions)
# ----------------------------------------------------------------------
@router.post("/{external_id}/profile")
def save_profile(external_id: str, body: dict, db: Session = Depends(get_db)):
    borrower = db.query(Borrower).filter(Borrower.external_id == external_id).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found")

    def safe_float(v):
        try:
            if v in (None, "", "null", "None", "Unknown", "NA", "N/A"):
                return None
            return float(v)
        except Exception:
            return None

    def safe_int(v):
        try:
            if v in (None, "", "null", "None", "Unknown", "NA", "N/A"):
                return None
            return int(float(v))
        except Exception:
            return None

    def safe_str(v):
        return str(v).strip() if v not in (None, "", "null", "None") else None

    borrower.age = safe_int(body.get("Age"))
    borrower.occupation = safe_str(body.get("Occupation"))
    borrower.annual_income = safe_float(body.get("Annual_Income"))
    borrower.monthly_inhand_salary = safe_float(body.get("Monthly_Inhand_Salary"))
    borrower.num_bank_accounts = safe_int(body.get("Num_Bank_Accounts"))
    borrower.num_credit_card = safe_int(body.get("Num_Credit_Card"))
    borrower.interest_rate = safe_float(body.get("Interest_Rate"))
    borrower.num_of_loan = safe_int(body.get("Num_of_Loan"))
    borrower.delay_from_due_date = safe_int(body.get("Delay_from_due_date"))
    borrower.num_of_delayed_payment = safe_int(body.get("Num_of_Delayed_Payment"))
    borrower.total_emi_per_month = safe_float(body.get("Total_EMI_per_month"))
    borrower.total_debt = safe_float(body.get("Total_Debt"))
    borrower.total_assets = safe_float(body.get("Total_Assets"))
    borrower.amount_invested_monthly = safe_float(body.get("Amount_invested_monthly"))
    borrower.monthly_balance = safe_float(body.get("Monthly_Balance"))
    borrower.type_of_loan = safe_str(body.get("Type_of_Loan"))

    # Derived ratios (with safe guards)
    if borrower.total_debt and borrower.total_assets and borrower.total_assets != 0:
        borrower.debt_to_asset_ratio = abs(borrower.total_debt / borrower.total_assets)
    else:
        borrower.debt_to_asset_ratio = None

    if borrower.total_assets and borrower.annual_income and borrower.annual_income != 0:
        borrower.asset_to_income_ratio = abs(borrower.total_assets / borrower.annual_income)
    else:
        borrower.asset_to_income_ratio = None

    if borrower.total_assets and borrower.total_debt is not None:
        val = (borrower.total_assets - borrower.total_debt) / borrower.total_assets
        # ✅ Never violate DB constraint
        borrower.networth_to_totalassets_ratio = max(val, 0)
    else:
        borrower.networth_to_totalassets_ratio = None

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save borrower profile: {e}")

    return {"message": "Profile saved successfully"}


# ----------------------------------------------------------------------
# Calculate BharatScore
# ----------------------------------------------------------------------
@router.post("/{external_id}/calculate", response_model=ScoreOut)
def calculate_score(external_id: str, db: Session = Depends(get_db)):
    borrower = db.query(Borrower).filter(Borrower.external_id == external_id).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found")

    return score_borrower(external_id=external_id, db=db)


# ----------------------------------------------------------------------
# Force re-score
# ----------------------------------------------------------------------
@router.post("/{external_id}/score")
def score_now(external_id: str, db: Session = Depends(get_db)):
    return score_borrower(external_id=external_id, db=db)
