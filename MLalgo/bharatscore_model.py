import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, roc_auc_score
)
from xgboost import XGBClassifier
import matplotlib.pyplot as plt
import seaborn as sns
import os

# ---------------- PATH CONFIG ----------------
file_path = r"C:/Users/HP/Downloads/final_cleaned_normalized.csv"
output_dir = r"C:/Users/HP/Downloads/BharatScoreModelOutputs"
os.makedirs(output_dir, exist_ok=True)

# ---------------- LOAD DATA ----------------
print(f"📂 Loading dataset from: {file_path}")
df = pd.read_csv(file_path)
print(f"✅ Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

# ---------------- DROP IDENTIFIERS ----------------
drop_cols = ["ID", "Customer_ID", "Month", "Name", "SSN"]
df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True, errors="ignore")

# ---------------- ENCODE CATEGORICAL FEATURES ----------------
cat_cols = df.select_dtypes(include=["object"]).columns
for col in cat_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))

# ---------------- ENSURE CIBIL SCORE EXISTS ----------------
if "CIBIL_Score_300_900" not in df.columns:
    raise ValueError("❌ Missing column: 'CIBIL_Score_300_900'.")

# ---------------- AUTO-DETECT OPTIMAL THRESHOLD ----------------
# Find a cutoff that keeps the target balanced (not all 0 or all 1)
cibil_col = "CIBIL_Score_300_900"
percentile_cutoff = np.percentile(df[cibil_col], 30)  # risky = bottom 30%
print(f"📉 Auto-calculated CIBIL risk cutoff: {percentile_cutoff:.2f}")

df["target"] = (df[cibil_col] < percentile_cutoff).astype(int)

# Check class balance
balance = df["target"].value_counts(normalize=True)
print("\n🎯 Target Distribution:")
print(balance)

if len(balance) < 2:
    raise ValueError("❌ Only one class detected! Adjust threshold manually.")

# ---------------- TRAIN-TEST SPLIT ----------------
X = df.drop(columns=[cibil_col, "target"])
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n📊 Train shape: {X_train.shape}, Test shape: {X_test.shape}")

# ---------------- XGBOOST MODEL ----------------
model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.1,
    max_depth=6,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="logloss"
)

print("\n⚙️ Training BharatScore Model...")
model.fit(X_train, y_train)
print("✅ Training complete.")

# ---------------- PREDICTIONS ----------------
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

# ---------------- EVALUATION ----------------
accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_proba)
report = classification_report(y_test, y_pred, output_dict=True)
conf_matrix = confusion_matrix(y_test, y_pred)

print("\n📊 BharatScore Model Performance Summary:")
print(f"Accuracy: {accuracy:.4f}")
print(f"ROC-AUC: {roc_auc:.4f}")
print(f"Precision (High Risk): {report['1']['precision']:.4f}")
print(f"Recall (High Risk): {report['1']['recall']:.4f}")
print(f"F1-Score (High Risk): {report['1']['f1-score']:.4f}")

# ---------------- CONFUSION MATRIX ----------------
plt.figure(figsize=(6, 5))
sns.heatmap(conf_matrix, annot=True, fmt="d", cmap="Blues")
plt.title("BharatScore Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.show()

# ---------------- FEATURE IMPORTANCE ----------------
importance_df = pd.DataFrame({
    "Feature": X.columns,
    "Importance": model.feature_importances_
}).sort_values(by="Importance", ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=importance_df.head(10), x="Importance", y="Feature", palette="viridis")
plt.title("Top 10 Important Features Influencing BharatScore")
plt.tight_layout()
plt.show()

# ---------------- SAVE OUTPUTS ----------------
importance_path = os.path.join(output_dir, "feature_importance.csv")
importance_df.to_csv(importance_path, index=False)

print(f"\n✅ Feature importance saved at: {importance_path}")
print(f"📦 BharatScore model training completed successfully.")
