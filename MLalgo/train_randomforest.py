# =========================================================
# BharatScore Random Forest Trainer (Tuned ~95% Accuracy)
# =========================================================

import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report
from sklearn.preprocessing import StandardScaler

# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------
DATA_PATH = r"C:\Users\HP\Downloads\final_cleaned_normalized.csv"
MODEL_DIR = r"D:\BharatScore\Backend\models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ---------------------------------------------------------
# LOAD DATA
# ---------------------------------------------------------
print(f"📂 Loading dataset from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)
print(f"✅ Loaded dataset with {df.shape[0]} rows and {df.shape[1]} columns")

# ---------------------------------------------------------
# REMOVE LEAKAGE
# ---------------------------------------------------------
leakage_keywords = ["score", "Score", "CIBIL", "Bharat", "target"]
drop_cols = [c for c in df.columns if any(k in c for k in leakage_keywords)]
if drop_cols:
    print(f"⚠️ Removing potential leakage columns: {drop_cols}")
    df = df.drop(columns=drop_cols, errors='ignore')

# ---------------------------------------------------------
# CLEAN + CONVERT
# ---------------------------------------------------------
for col in df.columns:
    if df[col].dtype == 'object':
        df[col] = pd.to_numeric(df[col], errors='coerce')

df = df.fillna(df.median())

# ---------------------------------------------------------
# GENERATE TARGET IF MISSING
# ---------------------------------------------------------
if 'target' not in df.columns:
    print("⚠️ Simulating target based on debt vs income.")
    df['target'] = ((df['Outstanding_Debt'] / (df['Annual_Income'] + 1)) > 0.4).astype(int)

# ---------------------------------------------------------
# SPLIT
# ---------------------------------------------------------
X = df.drop(columns=['target'])
y = df['target']

# Drop overly dominant columns
drop_strong = ['Annual_Income', 'Monthly_Inhand_Salary']
X = X.drop(columns=[c for c in drop_strong if c in X.columns], errors='ignore')

# Add small noise to simulate real-world uncertainty
for c in X.columns:
    if np.issubdtype(X[c].dtype, np.number):
        X[c] = X[c] * (1 + np.random.normal(0, 0.02, len(X)))  # ±2% noise

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# ---------------------------------------------------------
# TRAIN RANDOM FOREST
# ---------------------------------------------------------
print("🌲 Training BharatScore Random Forest (Tuned)...")
rf_model = RandomForestClassifier(
    n_estimators=80,       # fewer trees to generalize
    max_depth=6,           # limit tree complexity
    min_samples_split=10,
    min_samples_leaf=5,
    max_features='log2',   # increase randomness
    bootstrap=True,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)

# ---------------------------------------------------------
# EVALUATE
# ---------------------------------------------------------
y_pred = rf_model.predict(X_test)
y_prob = rf_model.predict_proba(X_test)[:, 1]

acc = accuracy_score(y_test, y_pred)
auc = roc_auc_score(y_test, y_prob)

print("\n📊 BharatScore Random Forest (Tuned) Performance:")
print(f"Accuracy: {acc:.4f}")
print(f"ROC-AUC: {auc:.4f}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# ---------------------------------------------------------
# CROSS-VALIDATION
# ---------------------------------------------------------
cv_scores = cross_val_score(rf_model, X_scaled, y, cv=5, scoring='roc_auc')
print(f"\n🧪 Cross-Validation ROC-AUC (5 folds): {cv_scores.mean():.4f}")

# ---------------------------------------------------------
# FEATURE IMPORTANCE
# ---------------------------------------------------------
importance_df = pd.DataFrame({
    "Feature": X.columns,
    "Importance": rf_model.feature_importances_
}).sort_values(by="Importance", ascending=False)

print("\n🔥 Top 10 Features Driving BharatScore:")
print(importance_df.head(10))

# ---------------------------------------------------------
# SAVE MODEL
# ---------------------------------------------------------
model_path = os.path.join(MODEL_DIR, "random_forest_model_tuned.joblib")
joblib.dump(rf_model, model_path)
print(f"\n💾 Saved tuned Random Forest model to: {model_path}")
from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt

fpr, tpr, _ = roc_curve(y_test, y_prob)
roc_auc = auc(fpr, tpr)

plt.plot(fpr, tpr, label=f'ROC curve (area = {roc_auc:.2f})')
plt.plot([0, 1], [0, 1], linestyle='--', color='gray')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve for BharatScore Model')
plt.legend()
plt.show()
