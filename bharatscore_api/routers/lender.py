from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..db import get_db
from ..models import User, Borrower, BorrowerScore, BorrowerDocument, LenderDecision
from ..deps import get_current_user

router = APIRouter(prefix="/lenders", tags=["lenders"])


# --------------------------------------------------------------------
# FETCH BORROWER DETAILS BY EXTERNAL ID
# --------------------------------------------------------------------
@router.get("/borrowers/{external_id}")
def view_borrower_by_external(
    external_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Fetch borrower details, profile, documents, and risk/score info by external ID."""
    if current.role.value not in ("lender", "admin"):
        raise HTTPException(403, "Forbidden")

    borrower = db.query(Borrower).filter(Borrower.external_id == external_id).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found")

    score = db.query(BorrowerScore).filter(BorrowerScore.borrower_id == borrower.id).first()
    docs = db.query(BorrowerDocument).filter(BorrowerDocument.borrower_id == borrower.id).all()
    latest_decision = (
        db.query(LenderDecision)
        .filter(LenderDecision.borrower_id == borrower.id)
        .order_by(LenderDecision.decided_at.desc())
        .first()
    )

    default_prob = float(score.risk_probability) if score and score.risk_probability else 0.0
    rec_rate = None
    if default_prob >= 0.5:
        rec_rate = "12.0% - 16.0%"
    elif default_prob >= 0.25:
        rec_rate = "10.0% - 12.0%"
    else:
        rec_rate = "9.0% - 10.5%"

    return {
        "borrower": {
            "uuid": str(borrower.id),
            "external_id": borrower.external_id,
            "name": borrower.user.full_name if borrower.user else None,
            "email": borrower.user.email if borrower.user else None,
            "phone": None,
            "profile": {
                "age": borrower.age,
                "occupation": borrower.occupation,
                "annual_income": borrower.annual_income,
                "monthly_inhand_salary": borrower.monthly_inhand_salary,
                "num_bank_accounts": borrower.num_bank_accounts,
                "num_credit_card": borrower.num_credit_card,
                "num_of_loan": borrower.num_of_loan,
                "type_of_loan": borrower.type_of_loan,
            },
        },
        "documents": [
            {
                "doc_type": d.doc_type,
                "is_valid": d.is_valid,
                "extracted_json": d.extracted_json,
            }
            for d in docs
        ],
        "score": (
            {
                "value": float(score.score) if score and score.score is not None else None,
                "risk_probability": float(score.risk_probability)
                if score and score.risk_probability is not None
                else None,
            }
            if score
            else None
        ),
        "risk_assessment": {
            "default_probability": default_prob,
            "recommended_interest_rate": rec_rate,
        },
        "last_decision": (
            {
                "status": latest_decision.status,
                "notes": latest_decision.notes,
                "at": latest_decision.decided_at.isoformat(),
            }
            if latest_decision
            else None
        ),
    }


# --------------------------------------------------------------------
# RECORD LOAN DECISION
# --------------------------------------------------------------------
@router.patch("/borrowers/{borrower_id}/decision")
def decide(
    borrower_id: str,
    body: dict = Body(...),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Record a lender's loan decision (approved/rejected/pending)."""
    if current.role.value not in ("lender", "admin"):
        raise HTTPException(403, "Forbidden")

    try:
        bid = UUID(borrower_id)
    except Exception:
        raise HTTPException(400, "borrower_id must be a valid UUID")

    borrower = db.query(Borrower).filter(Borrower.id == bid).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found")

    status = (body.get("status") or "").lower().strip()
    if status not in ("approved", "rejected", "pending"):
        raise HTTPException(400, "status must be one of: approved | rejected | pending")

    decision = LenderDecision(
        borrower_id=borrower.id,
        status=status,
        notes=body.get("notes"),
        lender_id=current.id if hasattr(current, "id") else None,
    )
    db.add(decision)
    db.commit()
    return {"message": "Decision recorded", "status": status}


# --------------------------------------------------------------------
# BASIC STATS (for lender dashboard)
# --------------------------------------------------------------------
@router.get("/stats")
def lender_stats(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Summary metrics for lender/admin dashboards."""
    if current.role.value not in ("lender", "admin"):
        raise HTTPException(403, "Forbidden")

    total_borrowers = db.query(func.count(Borrower.id)).scalar() or 0
    total_decisions = db.query(func.count(LenderDecision.id)).scalar() or 0
    avg_score = db.query(func.avg(BorrowerScore.score)).scalar() or 0
    high_risk = (
        db.query(BorrowerScore)
        .filter(BorrowerScore.risk_probability > 0.5)
        .count()
        or 0
    )

    return {
        "total_borrowers": total_borrowers,
        "total_decisions": total_decisions,
        "average_bharatscore": round(float(avg_score), 2) if avg_score else None,
        "high_risk_borrowers": high_risk,
    }


# --------------------------------------------------------------------
# LATEST DECISIONS
# --------------------------------------------------------------------
@router.get("/decisions")
def list_lender_decisions(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Return latest loan decisions made by lender/admin."""
    if current.role.value not in ("lender", "admin"):
        raise HTTPException(403, "Forbidden")

    decisions = (
        db.query(LenderDecision)
        .order_by(LenderDecision.decided_at.desc())
        .limit(50)
        .all()
    )

    return [
        {
            "borrower_id": str(d.borrower_id),
            "status": d.status,
            "notes": d.notes,
            "decided_at": d.decided_at.isoformat() if d.decided_at else None,
        }
        for d in decisions
    ]


# --------------------------------------------------------------------
# ADMIN DASHBOARD OVERVIEW (Real DB Metrics)
# --------------------------------------------------------------------
@router.get("/admin/overview", tags=["admin"])
def admin_overview(
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Real metrics for Admin Dashboard — shows overall platform health."""
    if current.role.value not in ("admin",):
        raise HTTPException(403, "Forbidden")

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_borrowers = db.query(func.count(Borrower.id)).scalar() or 0
    scored_borrowers = db.query(func.count(BorrowerScore.id)).scalar() or 0
    avg_score = db.query(func.avg(BorrowerScore.score)).scalar() or 0
    high_risk = db.query(BorrowerScore).filter(BorrowerScore.risk_probability >= 0.5).count()
    total_loans = db.query(func.count(LenderDecision.id)).scalar() or 0

    return {
        "total_users": int(total_users),
        "total_borrowers": int(total_borrowers),
        "scored_borrowers": int(scored_borrowers),
        "average_score": round(float(avg_score), 2) if avg_score else 0,
        "high_risk_borrowers": int(high_risk),
        "active_loans": int(total_loans),
    }
