import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import re

# ---------------- PATHS ----------------
input_path = r"C:\Users\HP\Downloads\final.csv"
output_path = r"C:\Users\HP\Downloads\final_cleaned_normalized.csv"

print(f"📂 Loading dataset from: {input_path}")
df = pd.read_csv(input_path)
print(f"✅ Loaded successfully — {df.shape[0]} rows, {df.shape[1]} columns")

# ---------------- CLEAN AGE ----------------
if "Age" in df.columns:
    df["Age"] = (
        df["Age"].astype(str)
        .str.replace(r"[^0-9\-]", "", regex=True)
        .replace("", np.nan)
        .astype(float)
    )
    df.loc[df["Age"] < 0, "Age"] = np.nan  # remove negatives like -500
    df = df[df["Age"].between(20, 100, inclusive="both")]
    print(f"✅ Cleaned 'Age'. Valid entries: {df['Age'].notna().sum()}")

# ---------------- CLEAN CREDIT HISTORY AGE ----------------
for col in df.columns:
    if "credit_history" in col.lower():
        def parse_credit_age(x):
            if pd.isna(x):
                return np.nan
            years = re.search(r"(\d+)\s*Year", str(x))
            months = re.search(r"(\d+)\s*Month", str(x))
            y = int(years.group(1)) if years else 0
            m = int(months.group(1)) if months else 0
            return round(y + m / 12, 2)
        df[col] = df[col].apply(parse_credit_age)
        df = df[df[col] <= df["Age"]]
        print(f"✅ Parsed '{col}' into numeric values (years).")

# ---------------- CLEAN NUM_OF_DELAYED_PAYMENT ----------------
for col in df.columns:
    if "delayed_payment" in col.lower():
        df[col] = (
            df[col].astype(str)
            .str.replace(r"[^0-9\-]", "", regex=True)
            .replace("", np.nan)
            .astype(float)
        )
        df.loc[df[col] < 0, col] = 0
        df = df[df[col].between(0, 100, inclusive="both")]
        print(f"✅ Cleaned '{col}' values to 0–100 range.")

# ---------------- FILTER INVALID FINANCIAL LOGIC ----------------
if "Monthly_Inhand_Salary" in df.columns and "Annual_Income" in df.columns:
    df = df[df["Monthly_Inhand_Salary"] <= (df["Annual_Income"] / 12)]

for col in df.columns:
    if any(x in col.lower() for x in ["debt", "asset", "income"]):
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df = df[df[col] >= 0]

for col in df.columns:
    if "cibil" in col.lower() and "score" in col.lower():
        df = df[df[col].between(300, 900, inclusive="both")]

print(f"✅ Logical filters applied. Remaining rows: {len(df)}")

# ---------------- REMOVE OUTLIERS (IQR METHOD) ----------------
numeric_cols = df.select_dtypes(include=[np.number]).columns
for col in numeric_cols:
    Q1, Q3 = df[col].quantile(0.25), df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower, upper = Q1 - 3 * IQR, Q3 + 3 * IQR
    df = df[(df[col] >= lower) & (df[col] <= upper)]
print(f"✅ Outlier removal done. Rows remaining: {len(df)}")

# ---------------- NORMALIZE ----------------
scaler = MinMaxScaler()
df[numeric_cols] = scaler.fit_transform(df[numeric_cols])
print("✅ Numeric data normalized (0–1 scale).")

# ---------------- SAVE CLEAN DATA ----------------
df.to_csv(output_path, index=False)
print(f"\n✅ Noise-free, normalized dataset saved successfully at:\n{output_path}")
print(f"📏 Final shape: {df.shape}")
