from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User, UserRole, Borrower, BorrowerScore
from ..deps import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/metrics/dashboard")
def dashboard(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    if current.role.value != "admin":
        raise HTTPException(403, "Forbidden")

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_borrowers = db.query(func.count(Borrower.id)).scalar() or 0
    scored = db.query(func.count(BorrowerScore.borrower_id)).scalar() or 0

    avg_score = db.query(func.avg(BorrowerScore.score)).scalar()
    avg_score = float(avg_score) if avg_score is not None else None

    high_risk_rate = db.query(func.avg(func.cast(BorrowerScore.risk_probability >= 0.5, db.bind.dialect.dbapi.NUMERIC))).scalar()
    if high_risk_rate is not None:
        high_risk_rate = float(high_risk_rate)
    else:
        high_risk_rate = 0.0

    # 30-day activity series (borrowers created, scored per day)
    days = []
    created_series = []
    scored_series = []
    today = datetime.utcnow().date()
    for i in range(29, -1, -1):
        day = today - timedelta(days=i)
        next_day = day + timedelta(days=1)

        c = db.query(func.count(Borrower.id)).filter(
            Borrower.created_at >= day, Borrower.created_at < next_day
        ).scalar() or 0

        s = db.query(func.count(BorrowerScore.borrower_id)).filter(
            BorrowerScore.last_scored_at >= day, BorrowerScore.last_scored_at < next_day
        ).scalar() or 0

        days.append(day.isoformat())
        created_series.append(int(c))
        scored_series.append(int(s))

    return {
        "totals": {
            "total_users": total_users,
            "total_borrowers": total_borrowers,
            "borrowers_scored": scored,
            "avg_bharatscore": avg_score,
            "high_risk_rate": high_risk_rate,
        },
        "series": {
            "dates": days,
            "borrowers_created": created_series,
            "borrowers_scored": scored_series
        }
    }
