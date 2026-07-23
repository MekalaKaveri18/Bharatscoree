import pandas as pd
import json
import os

# -------- PATHS --------
TRAIN_PATH = r"C:\Users\HP\Downloads\final_cleaned_normalized.csv"
OUT_JSON   = r"D:\BharatScore\models\models\categorical_values.json"

# -------- COLUMNS TO EXTRACT --------
CAT_COLS = [
    "Occupation",
    "Changed_Credit_Limit",
    "Credit_Mix",
    "Payment_of_Min_Amount",
    "Amount_invested_monthly",
    "Payment_Behaviour",
    "Monthly_Balance",
    "Type_of_Loan"
]

# -------- LOAD DATA --------
print(f"📂 Loading: {TRAIN_PATH}")
df = pd.read_csv(TRAIN_PATH)
print(f"✅ Loaded dataset: {df.shape}")

# -------- EXTRACT UNIQUES --------
cat_uniques = {}

for col in CAT_COLS:
    if col not in df.columns:
        print(f"⚠️ Column missing in training CSV: {col}")
        cat_uniques[col] = []
        continue

    uniq = sorted(df[col].dropna().unique().tolist())
    cat_uniques[col] = uniq

    print(f"\n------ {col} ------")
    for v in uniq:
        print(v)

# -------- SAVE JSON --------
os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(cat_uniques, f, indent=2)

print(f"\n✅ Saved at: {OUT_JSON}")
