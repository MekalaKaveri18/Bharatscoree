import argparse, json, os
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
)
from xgboost import XGBRegressor, XGBClassifier
import joblib

RAW_ORDER = [
    "Age","Occupation","Annual_Income","Monthly_Inhand_Salary","Num_Bank_Accounts",
    "Num_Credit_Card","Interest_Rate","Num_of_Loan","Delay_from_due_date",
    "Num_of_Delayed_Payment","Changed_Credit_Limit","Num_Credit_Inquiries",
    "Credit_Mix","Outstanding_Debt","Credit_Utilization_Ratio","Credit_History_Age",
    "Payment_of_Min_Amount","Total_EMI_per_month","Amount_invested_monthly",
    "Payment_Behaviour","Monthly_Balance","Total_Debt","Total_Assets",
    "Debt_to_Asset_Ratio","Asset_to_Income_Ratio","NetWorth_to_TotalAssets_Ratio",
    "Type_of_Loan"
]

NUMERIC = [
    "Age","Annual_Income","Monthly_Inhand_Salary","Num_Bank_Accounts","Num_Credit_Card",
    "Interest_Rate","Num_of_Loan","Delay_from_due_date","Num_of_Delayed_Payment",
    "Num_Credit_Inquiries","Outstanding_Debt","Credit_Utilization_Ratio",
    "Credit_History_Age","Total_EMI_per_month","Total_Debt","Total_Assets",
    "Debt_to_Asset_Ratio","Asset_to_Income_Ratio","NetWorth_to_TotalAssets_Ratio"
]

CATEGORICAL = [
    "Occupation","Changed_Credit_Limit","Credit_Mix","Payment_of_Min_Amount",
    "Amount_invested_monthly","Payment_Behaviour","Monthly_Balance","Type_of_Loan"
]

def build_preprocessor():
    num_pipe = Pipeline(steps=[
        ("impute", SimpleImputer(strategy="median"))
    ])
    cat_pipe = Pipeline(steps=[
        ("impute", SimpleImputer(strategy="most_frequent")),
        ("ohe", OneHotEncoder(
            handle_unknown="infrequent_if_exist",   # ✅ unseen → “other”
            min_frequency=5,
            sparse_output=False
        ))
    ])
    pre = ColumnTransformer(
        transformers=[
            ("num", num_pipe, NUMERIC),
            ("cat", cat_pipe, CATEGORICAL),
        ],
        remainder="drop"
    )
    return pre

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=r"C:\Users\HP\Downloads\final_cleaned_normalized.csv")
    ap.add_argument("--out_dir", default=r"D:\BharatScore\models\models")
    ap.add_argument("--risk_percentile", type=float, default=30.0,
                    help="Bottom X%% considered high-risk for classifier target.")
    args = ap.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    df = pd.read_csv(args.data)

    # Keep only raw columns + target if present (drop identifiers if they exist)
    id_cols = ["ID", "Customer_ID", "Month", "Name", "SSN"]
    keep_cols = [c for c in RAW_ORDER if c in df.columns]
    df = df.drop(columns=[c for c in id_cols if c in df.columns], errors="ignore")
    df = df[keep_cols]

    # Build regression target from CIBIL if present; else create a dummy (for training on provided CSV)
    # If your CSV already has normalized target skip this part. We'll assume we keep raw CIBIL for regression:
    # If a column 'CIBIL_Score_300_900' exists, normalize to 0..1 for regression label
    reg_y = None
    if "CIBIL_Score_300_900" in df.columns:
        cibil = df["CIBIL_Score_300_900"].astype(float)
        reg_y = (cibil - 300.0) / 600.0
        reg_y = reg_y.clip(0, 1)
        df = df.drop(columns=["CIBIL_Score_300_900"])
    else:
        # No direct label present -> create a synthetic label by heuristic (median of some ratios)
        # You can replace this with your preferred label construction.
        ratios = df[["Debt_to_Asset_Ratio","Asset_to_Income_Ratio"]].astype(float)
        reg_y = 1 - ratios.mean(axis=1)
        reg_y = np.clip((reg_y - reg_y.min()) / (reg_y.max() - reg_y.min() + 1e-8), 0, 1)

    # Classification target: bottom risk_percentile of reg_y is high-risk = 1
    cutoff = np.percentile(reg_y, args.risk_percentile)
    clf_y = (reg_y <= cutoff).astype(int)

    X = df.copy()
    # Reorder to strict RAW_ORDER we decided
    X = X.reindex(columns=RAW_ORDER)

    X_tr, X_te, y_reg_tr, y_reg_te = train_test_split(X, reg_y, test_size=0.2, random_state=42)
    _,    _, y_clf_tr, y_clf_te = train_test_split(X, clf_y, test_size=0.2, random_state=42)

    pre = build_preprocessor()

    reg_pipe = Pipeline([
        ("pre", pre),
        ("model", XGBRegressor(
            n_estimators=300, learning_rate=0.1, max_depth=6,
            subsample=0.8, colsample_bytree=0.8, random_state=42,
            tree_method="hist", eval_metric="rmse"
        ))
    ])
    clf_pipe = Pipeline([
        ("pre", pre),
        ("model", XGBClassifier(
            n_estimators=300, learning_rate=0.1, max_depth=6,
            subsample=0.8, colsample_bytree=0.8, random_state=42,
            tree_method="hist", eval_metric="logloss", use_label_encoder=False
        ))
    ])

    print("⚙️ Training regression...")
    reg_pipe.fit(X_tr, y_reg_tr)
    y_reg_pred = reg_pipe.predict(X_te)
    mae  = mean_absolute_error(y_reg_te, y_reg_pred)
    rmse = mean_squared_error(y_reg_te, y_reg_pred) ** 0.5
    r2   = r2_score(y_reg_te, y_reg_pred)

    print("⚙️ Training classification...")
    clf_pipe.fit(X_tr, y_clf_tr)
    y_clf_pred  = clf_pipe.predict(X_te)
    y_clf_proba = clf_pipe.predict_proba(X_te)[:, 1]
    acc  = accuracy_score(y_clf_te, y_clf_pred)
    prec = precision_score(y_clf_te, y_clf_pred, zero_division=0)
    rec  = recall_score(y_clf_te, y_clf_pred, zero_division=0)
    f1   = f1_score(y_clf_te, y_clf_pred, zero_division=0)
    auc  = roc_auc_score(y_clf_te, y_clf_proba)

    # Save artifacts
    reg_path = os.path.join(args.out_dir, "bharatscore_regression_pipeline.joblib")
    clf_path = os.path.join(args.out_dir, "bharatscore_classification_pipeline.joblib")
    joblib.dump(reg_pipe, reg_path)
    joblib.dump(clf_pipe, clf_path)

    # Save meta with raw column order (the ONLY thing the API needs to align)
    meta = {
        "raw_columns": RAW_ORDER,
        "numeric": NUMERIC,
        "categorical": CATEGORICAL,
        "ohe_min_frequency": 5,
        "impute_numeric": "median",
        "impute_categorical": "most_frequent",
        "risk_percentile": args.risk_percentile,
        "risk_proba_threshold_default": 0.5,
        "scaled_score_formula": "scaled = raw*600 + 300"
    }
    with open(os.path.join(args.out_dir, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    # Save metrics
    reports_dir = os.path.join(os.path.dirname(args.out_dir), "reports")
    os.makedirs(reports_dir, exist_ok=True)
    metrics = {
        "regression": {"MAE": mae, "RMSE": rmse, "R2": r2},
        "classification": {
            "accuracy": acc, "precision": prec, "recall": rec, "f1": f1, "roc_auc": auc
        }
    }
    with open(os.path.join(reports_dir, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print("\n📈 Regression:", metrics["regression"])
    print("🎯 Classification:", metrics["classification"])
    print("\n📦 Saved:")
    print(" -", reg_path)
    print(" -", clf_path)
    print(" -", os.path.join(args.out_dir, "meta.json"))
    print(" -", os.path.join(reports_dir, "metrics.json"))

if __name__ == "__main__":
    main()
