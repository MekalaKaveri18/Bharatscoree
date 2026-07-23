from fileinput import filename
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Borrower
import random

router = APIRouter(prefix="/docs", tags=["docs"])


@router.post("/extract")
async def extract_document(
    borrower_id: str = Form(...),  # external_id
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    # Fetch borrower by external_id
    b = db.query(Borrower).filter(Borrower.external_id == borrower_id).first()
    if not b:
        raise HTTPException(404, detail="Borrower not found")

    fields = {}
    quality = "GOOD"

    # Optional name hint from user
    name_hint = getattr(getattr(b, "user", None), "full_name", None)

    doc_type_upper = doc_type.upper()

    # 🧾 Simulated extraction patterns
    if doc_type_upper == "AADHAAR":
        fields = {
            "name": name_hint or "Name_Pattern",
            "aadhaar_masked": f"XXXX-XXXX-{random.randint(1000, 9999)}",
            "dob": "YYYY-MM-DD",
            "address": "Extracted_Address_Pattern",
        }

    elif doc_type_upper == "PAN":
        fields = {
            "name": name_hint or "Name_Pattern",
            "pan": f"ABCDE{random.randint(1000,9999)}F",
            "dob": "YYYY-MM-DD",
        }

    elif doc_type_upper == "BANK_STATEMENT":
        fields = {
            "bank_name": f"Bank_{random.randint(100,999)}",
            "avg_balance": "₹XXXX.XX",
            "credits_3m": "XX",
            "debits_3m": "XX",
        }

    elif doc_type_upper == "SALARY_SLIP":
        fields = {
            "employer": "Employer_Name_Pattern",
            "gross_monthly": "₹XX,XXX",
            "net_monthly": "₹XX,XXX",
        }

    elif doc_type_upper == "LOAN_STATEMENT":
        fields = {
            "total_loan_amount": "₹X,XX,XXX",
            "emi": "₹X,XXX",
            "interest_rate": "XX.X%",
            "remaining_balance": "₹X,XX,XXX",
        }

    elif doc_type_upper == "ASSET_DOCUMENT":
        # ✅ Allow ANY document as valid for assets
        fields = {
            "asset_type": "User Provided Document",
            "estimated_value": "₹X,XX,XXX",
            "note": "Accepted as proof of asset ownership",
        }
        is_valid = True
        quality = "GOOD"
    elif doc_type_upper == "UTILITY_BILL":
        fields = {
            "bill_type": "Bill_Type_Pattern",
            "average_amount": "₹XXX",
            "address_match": "Match_Pattern",
        }

    else:
        fields = {"note": "Unknown or unsupported document type"}
        quality = "LOW"

    return {
        "fields": fields,
        "quality": quality,
        "is_valid": True if quality == "GOOD" else False,
    }
