from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from ..db import get_db
from ..models import Borrower, BorrowerScore
from ..ml import run_bharat_score   # <-- we will implement this util next

router = APIRouter(prefix="/borrower", tags=["borrower"])

@router.post("/{borrower_id}/score")
def score_borrower(borrower_id: str, db: Session = Depends(get_db)):
    # 1) Borrower exists?
    borrower = db.query(Borrower).filter(Borrower.external_id == borrower_id).first()
    if not borrower:
        raise HTTPException(404, "Borrower not found")

    # 2) Check existing score & 30 day rule
    existing = db.query(BorrowerScore).filter(BorrowerScore.borrower_id == borrower.id).first()
    if existing:
        days_passed = (datetime.now(timezone.utc) - existing.last_scored_at).days
        if days_passed < 30:
            next_date = existing.last_scored_at + timedelta(days=30)
            raise HTTPException(
                status_code=400,
                detail=f"You last scored on {existing.last_scored_at.date()}. "
                       f"You can re-score after {next_date.date()}. Keep improving your profile ✅"
            )

    # 3) Run the ML model (XGBoost)
    score_value, risk_prob = run_bharat_score(borrower, db)

    # 4) Insert or update score in DB
    if existing:
        existing.score = score_value
        existing.risk_probability = risk_prob
        existing.last_scored_at = datetime.now(timezone.utc)
    else:
        new = BorrowerScore(
            borrower_id=borrower.id,
            score=score_value,
            risk_probability=risk_prob,
            last_scored_at=datetime.now(timezone.utc)
        )
        db.add(new)

    db.commit()

    return {
        "message": "BharatScore calculated successfully",
        "score": score_value,
        "risk_probability": risk_prob
    }
