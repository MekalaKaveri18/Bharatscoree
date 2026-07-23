import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, roc_auc_score
)
import matplotlib.pyplot as plt
import seaborn as sns
import os

# ---------------- CONFIG ----------------
file_path = r"C:/Users/HP/Downloads/final_cleaned_normalized.csv"
output_dir = r"C:/Users/HP/Downloads/BharatScore_LogisticFinal"
os.makedirs(output_dir, exist_ok=True)

# ---------------- LOAD DATA ----------------
print(f"📂 Loading dataset from: {file_path}")
df = pd.read_csv(file_path)
print(f"✅ Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

# ---------------- CLEAN UP ----------------
drop_cols = ["ID", "Customer_ID", "Month", "Name", "SSN"]
df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True, errors="ignore")

# ---------------- ENCODE CATEGORICAL ----------------
cat_cols = df.select_dtypes(include=["object"]).columns
for col in cat_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))

# ---------------- VERIFY CIBIL COLUMN ----------------
if "CIBIL_Score_300_900" not in df.columns:
    raise ValueError("❌ Missing 'CIBIL_Score_300_900' column.")

# ---------------- DERIVED RATIOS ----------------
df["Debt_to_Asset_Ratio"] = df["Outstanding_Debt"] / (df["Annual_Income"] + 1)
df["EMI_to_Income_Ratio"] = df["Total_EMI_per_month"] / (df["Monthly_Inhand_Salary"] + 1)
df["Balance_to_Income_Ratio"] = df["Monthly_Balance"] / (df["Monthly_Inhand_Salary"] + 1)

df.replace([np.inf, -np.inf], np.nan, inplace=True)
df.fillna(df.median(numeric_only=True), inplace=True)

# ---------------- ADD MILD NOISE ----------------
for col in ["Annual_Income", "Outstanding_Debt", "Monthly_Inhand_Salary"]:
    if col in df.columns:
        df[col] = df[col] * (1 + np.random.normal(0, 0.01, len(df)))  # ±1%

# ---------------- DYNAMIC CUT-OFF ----------------
# Automatically find a threshold that creates 2 classes (0-safe, 1-risky)
cutoff = np.percentile(df["CIBIL_Score_300_900"], 30)
df["target"] = (df["CIBIL_Score_300_900"] < cutoff).astype(int)

# If still only one class, fallback to 40th percentile
if len(df["target"].unique()) < 2:
    cutoff = np.percentile(df["CIBIL_Score_300_900"], 40)
    df["target"] = (df["CIBIL_Score_300_900"] < cutoff).astype(int)

print(f"\n📉 Dynamic cutoff used: {cutoff:.2f}")
print("🎯 Target class distribution:")
print(df["target"].value_counts(normalize=True))

# ---------------- FEATURE TRANSFORMATIONS ----------------
df["log_Income"] = np.log1p(df["Annual_Income"])
df["log_Debt"] = np.log1p(df["Outstanding_Debt"])
df["Income_x_History"] = df["Annual_Income"] * df["Credit_History_Age"]
df["Debt_x_Loans"] = df["Outstanding_Debt"] * df["Num_of_Loan"]

# ---------------- FEATURE SELECTION ----------------
features = [
    "Age", "log_Income", "log_Debt", "Num_of_Loan", "Num_of_Delayed_Payment",
    "Credit_History_Age", "Total_EMI_per_month", "Monthly_Balance",
    "Debt_to_Asset_Ratio", "EMI_to_Income_Ratio", "Balance_to_Income_Ratio",
    "Income_x_History", "Debt_x_Loans"
]
X = df[features]
y = df["target"]

# ---------------- CHECK TARGET VALIDITY ----------------
if len(y.unique()) < 2:
    raise ValueError("❌ Target column still has only one class! Check your dataset's CIBIL score range.")

# ---------------- SCALING ----------------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ---------------- TRAIN-TEST SPLIT ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# ---------------- MODEL TRAINING ----------------
print("\n⚙️ Training Final Calibrated Logistic Regression (CIBIL-style)...")
model = LogisticRegression(
    max_iter=1000,
    solver="liblinear",
    C=1.0,
    class_weight="balanced",
    random_state=42
)
model.fit(X_train, y_train)
print("✅ Training complete.")

# ---------------- PREDICT ----------------
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

# ---------------- EVALUATION ----------------
accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_proba)
report = classification_report(y_test, y_pred, output_dict=True)
conf_matrix = confusion_matrix(y_test, y_pred)

print("\n📊 Logistic Regression (Final CIBIL-Style BharatScore) Summary:")
print(f"Accuracy: {accuracy:.4f}")
print(f"ROC-AUC: {roc_auc:.4f}")
print(f"Precision (High Risk): {report['1']['precision']:.4f}")
print(f"Recall (High Risk): {report['1']['recall']:.4f}")
print(f"F1-Score (High Risk): {report['1']['f1-score']:.4f}")

# ---------------- CONFUSION MATRIX ----------------
plt.figure(figsize=(6, 5))
sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Purples")
plt.title("Confusion Matrix - Final Logistic Regression (CIBIL-Style)")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.show()

# ---------------- SAVE RESULTS ----------------
results = pd.DataFrame({
    "Metric": ["Accuracy", "ROC_AUC", "Precision (High Risk)", "Recall (High Risk)", "F1-Score (High Risk)"],
    "Value": [accuracy, roc_auc, report["1"]["precision"], report["1"]["recall"], report["1"]["f1-score"]],
})
results.to_csv(os.path.join(output_dir, "logistic_final_performance.csv"), index=False)

print(f"\n✅ Results saved to: {output_dir}")
