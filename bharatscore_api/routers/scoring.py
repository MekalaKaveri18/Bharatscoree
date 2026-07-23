import os
import json
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Borrower, BorrowerScore

router = APIRouter(prefix="/scoring", tags=["scoring"])

# ---------------------------------------------------------
# Model artifacts
# ---------------------------------------------------------
MODELS_DIR = r"D:\BharatScore\models\models"
REG_PATH = os.path.join(MODELS_DIR, "bharatscore_regression_pipeline.joblib")
CLF_PATH = os.path.join(MODELS_DIR, "bharatscore_classification_pipeline.joblib")
META_PATH = os.path.join(MODELS_DIR, "meta.json")

# Load models once
try:
    _REG = joblib.load(REG_PATH)
    _CLF = joblib.load(CLF_PATH)
except Exception as e:
    raise RuntimeError(f"Failed loading model pipelines from {MODELS_DIR}: {e}")

try:
    with open(META_PATH, "r", encoding="utf-8") as f:
        _META = json.load(f)
    RAW_ORDER = _META["raw_columns"]
except Exception as e:
    raise RuntimeError(f"Failed loading meta.json at {META_PATH}: {e}")

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
MONTHLY_COOLDOWN_DAYS = 30
DEFAULT_RISK_THRESHOLD = float(_META.get("risk_proba_threshold_default", 0.5))


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _cooldown_remaining(last: Optional[datetime]) -> int:
    if not last:
        return 0
    delta = (_now_utc() - last)
    if delta.days >= MONTHLY_COOLDOWN_DAYS:
        return 0
    return max(0, MONTHLY_COOLDOWN_DAYS - delta.days)


# ---------------------------------------------------------
# Safe type conversion helpers
# ---------------------------------------------------------
def _safe_float(v):
    try:
        if v in (None, "", "None", "Unknown", "null", "N/A", "NaN"):
            return None
        if isinstance(v, (list, dict)):
            return None
        return float(v)
    except Exception:
        return None


def _safe_int(v):
    try:
        if v in (None, "", "None", "Unknown", "null", "N/A", "NaN"):
            return None
        if isinstance(v, (list, dict)):
            return None
        return int(float(v))
    except Exception:
        return None


def _safe_str(v):
    if v in (None, "", "None", "Unknown", "null", "N/A", "NaN"):
        return None
    return str(v).strip()


# ---------------------------------------------------------
# Feature builder
# ---------------------------------------------------------
def _build_feature_row_from_borrower(b: Borrower) -> Dict[str, Any]:
    """Build one sanitized row in RAW_ORDER"""
    m = {
        "Age": _safe_int(b.age),
        "Occupation": _safe_str(b.occupation),
        "Annual_Income": _safe_float(b.annual_income),
        "Monthly_Inhand_Salary": _safe_float(b.monthly_inhand_salary),
        "Num_Bank_Accounts": _safe_int(b.num_bank_accounts),
        "Num_Credit_Card": _safe_int(b.num_credit_card),
        "Interest_Rate": _safe_float(b.interest_rate),
        "Num_of_Loan": _safe_int(b.num_of_loan),
        "Delay_from_due_date": _safe_int(b.delay_from_due_date),
        "Num_of_Delayed_Payment": _safe_int(b.num_of_delayed_payment),
        "Total_EMI_per_month": _safe_float(b.total_emi_per_month),
        "Monthly_Balance": _safe_float(b.monthly_balance),
        "Amount_invested_monthly": _safe_float(b.amount_invested_monthly),
        "Total_Debt": _safe_float(b.total_debt),
        "Total_Assets": _safe_float(b.total_assets),
        "Debt_to_Asset_Ratio": _safe_float(b.debt_to_asset_ratio),
        "Asset_to_Income_Ratio": _safe_float(b.asset_to_income_ratio),
        "NetWorth_to_TotalAssets_Ratio": _safe_float(b.networth_to_totalassets_ratio),
        "Type_of_Loan": _safe_str(b.type_of_loan),
    }

    # Fill missing model columns
    for k in [
        "Changed_Credit_Limit",
        "Num_Credit_Inquiries",
        "Credit_Mix",
        "Outstanding_Debt",
        "Credit_Utilization_Ratio",
        "Credit_History_Age",
        "Payment_of_Min_Amount",
        "Payment_Behaviour",
    ]:
        m[k] = None

    # Ensure full feature order
    for col in RAW_ORDER:
        if col not in m:
            m[col] = None

    return {k: m.get(k) for k in RAW_ORDER}


def _scale_300_900(raw: np.ndarray) -> np.ndarray:
    return raw * 600.0 + 300.0


# ---------------------------------------------------------
# Score endpoint
# ---------------------------------------------------------
@router.post("/borrowers/{external_id}/score")
def score_borrower(
    external_id: str,
    db: Session = Depends(get_db),
    risk_threshold: Optional[float] = Query(default=None, description="Override risk probability threshold")
):
    borrower = db.query(Borrower).filter(Borrower.external_id == external_id).first()
    if not borrower:
        raise HTTPException(status_code=404, detail="Borrower not found")

    # --- Handle cooldown ---
    bs = db.query(BorrowerScore).filter(BorrowerScore.borrower_id == borrower.id).first()
    if bs and bs.last_scored_at:
        remaining = _cooldown_remaining(bs.last_scored_at)
        if remaining > 0:
            raise HTTPException(
                400,
                detail=f"Re-scoring not allowed yet. Wait {remaining} more day(s)."
            )

    # --- Handle internal call case ---
    if not isinstance(risk_threshold, (float, int, type(None))):
        risk_threshold = None

    # --- Build data ---
    row = _build_feature_row_from_borrower(borrower)
    X = pd.DataFrame([row], columns=RAW_ORDER)

    # --- Predict score ---
    try:
        raw_reg = _REG.predict(X)
        scaled = _scale_300_900(raw_reg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Regression failed: {e}")

    # --- Predict risk ---
    try:
        proba = _CLF.predict_proba(X)[:, 1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Classification failed: {e}")

    score_value = float(np.clip(scaled[0], 300.0, 900.0))
    risk_prob = float(proba[0])

    thr = DEFAULT_RISK_THRESHOLD if risk_threshold is None else float(risk_threshold)
    high_risk_flag = int(risk_prob >= thr)
    now = _now_utc()

    # --- Save ---
    if bs:
        bs.score = score_value
        bs.risk_probability = risk_prob
        bs.last_scored_at = now
    else:
        bs = BorrowerScore(
            borrower_id=borrower.id,
            score=score_value,
            risk_probability=risk_prob,
            last_scored_at=now,
        )
        db.add(bs)

    db.commit()

    return {
        "external_id": external_id,
        "borrower_uuid": str(borrower.id),
        "score": round(score_value, 2),
        "risk_probability": round(risk_prob, 6),
        "risk_threshold_used": thr,
        "high_risk_flag": high_risk_flag,
        "last_scored_at": now.isoformat(),
        "cooldown_days": MONTHLY_COOLDOWN_DAYS,
    }


# ---------------------------------------------------------
# Get latest score
# ---------------------------------------------------------
@router.get("/borrowers/{external_id}/score")
def get_latest_score(external_id: str, db: Session = Depends(get_db)):
    borrower = db.query(Borrower).filter(Borrower.external_id == external_id).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found")

    bs = db.query(BorrowerScore).filter(BorrowerScore.borrower_id == borrower.id).first()
    if not bs:
        raise HTTPException(404, "No score available")

    remaining = _cooldown_remaining(bs.last_scored_at)
    return {
        "external_id": external_id,
        "borrower_uuid": str(borrower.id),
        "score": float(bs.score) if bs.score is not None else None,
        "risk_probability": float(bs.risk_probability)
        if bs.risk_probability is not None
        else None,
        "last_scored_at": bs.last_scored_at.isoformat() if bs.last_scored_at else None,
        "cooldown_days_remaining": remaining,
        "cooldown_days": MONTHLY_COOLDOWN_DAYS,
    }
