# D:\BharatScore\bharatscore_api\ml\train_bharatscore.py
import os
import re
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, r2_score

# ---- CONFIG ----
CSV_PATH = r"C:/Users/HP/Downloads/final_cleaned_normalized.csv"  # <== update filename only
ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "models"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = ARTIFACTS_DIR / "bharatscore_xgb_pipeline.pkl"
FEATURES_PATH = ARTIFACTS_DIR / "feature_info.json"

TARGET = "CIBIL_Score_300_900"

def parse_credit_history_age(s: str) -> float:
    """Convert '5 Years 4 Months' -> 64 months."""
    if not isinstance(s, str):
        return np.nan
    y = re.search(r'(\d+)\s*Year', s, flags=re.I)
    m = re.search(r'(\d+)\s*Month', s, flags=re.I)
    years = int(y.group(1)) if y else 0
    months = int(m.group(1)) if m else 0
    return years * 12 + months

def count_loan_types(s: str) -> int:
    if not isinstance(s, str) or not s.strip():
        return 0
    # split by comma and remove blanks
    return len([p.strip() for p in s.split(",") if p.strip()])

def load_and_clean(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    # Drop the broken duplicate header if it exists
    if '"number of loans, "' in df.columns:
        df = df.drop(columns=['"number of loans, "'], errors="ignore")

    # Basic trims on string columns
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    # Feature engineering
    df["credit_history_months"] = df["Credit_History_Age"].apply(parse_credit_history_age)
    df["num_loan_types"] = df["Type_of_Loan"].apply(count_loan_types)
    df["is_min_pay_yes"] = df["Payment_of_Min_Amount"].str.lower().isin(["yes", "y", "paid"]).astype(int)

    # Numeric cleanup (coerce)
    numeric_like = [
        "Age","Annual_Income","Monthly_Inhand_Salary","Num_Bank_Accounts","Num_Credit_Card",
        "Interest_Rate","Num_of_Loan","Num_of_Delayed_Payment","Changed_Credit_Limit",
        "Num_Credit_Inquiries","Outstanding_Debt","Credit_Utilization_Ratio",
        "Total_EMI_per_month","Amount_invested_monthly","Monthly_Balance",
        "Total_Debt","Total_Assets","Debt_to_Asset_Ratio","Asset_to_Income_Ratio","NetWorth_to_TotalAssets_Ratio",
        "credit_history_months","num_loan_types","is_min_pay_yes",
        TARGET
    ]
    for col in numeric_like:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Drop ID-like columns that don’t help predictive power
    drop_cols = ["ID","Customer_ID","SSN","Name","Month","Type_of_Loan","Payment_of_Min_Amount","Credit_History_Age"]
    df = df.drop(columns=[c for c in drop_cols if c in df.columns], errors="ignore")

    return df

def main():
    df = load_and_clean(CSV_PATH)
    # Separate target
    y = df[TARGET].copy()
    X = df.drop(columns=[TARGET])

    # Suggest categorical columns (remaining object types, if any)
    cat_cols = X.select_dtypes(include=["object"]).columns.tolist()
    num_cols = [c for c in X.columns if c not in cat_cols]

    # Preprocess
    pre = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
            ("num", "passthrough", num_cols),
        ]
    )

    # Model
    model = XGBRegressor(
        n_estimators=600,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.9,
        colsample_bytree=0.9,
        reg_alpha=1.0,
        reg_lambda=2.0,
        random_state=42,
        tree_method="hist"  # good on CPU
    )

    pipe = Pipeline(steps=[("pre", pre), ("xgb", model)])

    # Split
    X_train, X_valid, y_train, y_valid = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Train
    pipe.fit(X_train, y_train)

    # Evaluate
    preds = pipe.predict(X_valid)
    mae = float(np.round(mean_absolute_error(y_valid, preds), 3))
    r2 = float(np.round(r2_score(y_valid, preds), 3))
    print(f"[Eval] MAE={mae}  R2={r2}")

    # Persist
    joblib.dump(pipe, MODEL_PATH)
    print(f"✅ Saved pipeline to: {MODEL_PATH}")

    # Save a tiny feature manifest (optional)
    try:
        import json
        feature_info = {
            "cat_cols": cat_cols,
            "num_cols": num_cols,
            "target": TARGET,
            "mae": mae,
            "r2": r2
        }
        with open(FEATURES_PATH, "w", encoding="utf-8") as f:
            json.dump(feature_info, f, indent=2)
        print(f"✅ Saved feature info to: {FEATURES_PATH}")
    except Exception as e:
        print("⚠️ Could not write feature_info.json:", e)

if __name__ == "__main__":
    main()
