# =========================================================
# BharatScore Multivariable Regression (Realistic + Regularized)
# =========================================================

import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import matplotlib.pyplot as plt
import seaborn as sns

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
print(f"✅ Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

# ---------------------------------------------------------
# GENERATE REALISTIC BHARATSCORE TARGET
# ---------------------------------------------------------
if 'BharatScore' not in df.columns:
    print("⚠️ Simulating BharatScore with real-world variation (±25 points)...")
    np.random.seed(42)
    df['BharatScore'] = (
        300
        + 600 * (
            0.5 * (df['Annual_Income'] / df['Annual_Income'].max()) +
            0.3 * (1 - df['Outstanding_Debt'] / df['Outstanding_Debt'].max()) +
            0.2 * (df['Total_Assets'] / df['Total_Assets'].max())
        )
        + np.random.normal(0, 25, len(df))  # ±25 random noise to simulate uncertainty
    ).clip(300, 900)

# ---------------------------------------------------------
# FEATURE SELECTION
# ---------------------------------------------------------
drop_cols = ['CIBIL_Score_300_900', 'target', 'BharatScore']
X = df.drop(columns=[c for c in drop_cols if c in df.columns], errors='ignore')
y = df['BharatScore']

# Convert all object columns to numeric
for col in X.columns:
    if X[col].dtype == 'object':
        X[col] = pd.to_numeric(X[col], errors='coerce')

X = X.fillna(0)

# ---------------------------------------------------------
# TRAIN/TEST SPLIT
# ---------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"📊 Training set: {X_train.shape}, Testing set: {X_test.shape}")

# ---------------------------------------------------------
# DEFINE MODELS
# ---------------------------------------------------------
models = {
    "LinearRegression": LinearRegression(),
    "RidgeRegression": Ridge(alpha=0.8, random_state=42),
    "LassoRegression": Lasso(alpha=0.001, random_state=42)
}

results = {}

# ---------------------------------------------------------
# TRAIN & EVALUATE EACH MODEL
# ---------------------------------------------------------
for name, model in models.items():
    print(f"\n⚙️ Training {name}...")
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    results[name] = {"R2": r2, "MAE": mae, "RMSE": rmse}
    print(f"{name} → R²: {r2:.4f}, MAE: {mae:.2f}, RMSE: {rmse:.2f}")

    # Save the model
    model_path = os.path.join(MODEL_DIR, f"{name.lower()}_bharatscore_model.joblib")
    joblib.dump(model, model_path)

# ---------------------------------------------------------
# COMPARE RESULTS
# ---------------------------------------------------------
results_df = pd.DataFrame(results).T
print("\n📈 Model Comparison Summary:")
print(results_df)

best_model_name = results_df["R2"].idxmax()
print(f"\n🏆 Best Model: {best_model_name} (R²={results_df.loc[best_model_name, 'R2']:.4f})")

# ---------------------------------------------------------
# FEATURE IMPORTANCE (Linear Model)
# ---------------------------------------------------------
best_model = models[best_model_name]
coef_df = pd.DataFrame({
    'Feature': X.columns,
    'Coefficient': best_model.coef_
}).sort_values(by='Coefficient', ascending=False)

plt.figure(figsize=(10, 6))
sns.barplot(data=coef_df.head(15), x='Coefficient', y='Feature', palette='viridis')
plt.title(f"Top 15 Features Influencing BharatScore ({best_model_name})")
plt.tight_layout()
plt.savefig(os.path.join(MODEL_DIR, "bharatscore_coefficients.png"))
print("📊 Feature importance chart saved as bharatscore_coefficients.png")

# ---------------------------------------------------------
# PLOT PREDICTION FIT
# ---------------------------------------------------------
plt.figure(figsize=(6, 6))
sns.scatterplot(x=y_test, y=best_model.predict(X_test), alpha=0.6)
plt.xlabel("Actual BharatScore")
plt.ylabel("Predicted BharatScore")
plt.title(f"Actual vs Predicted BharatScore ({best_model_name})")
plt.plot([300, 900], [300, 900], color='red', linestyle='--')
plt.tight_layout()
plt.savefig(os.path.join(MODEL_DIR, "bharatscore_fit.png"))
print("📈 Fit visualization saved as bharatscore_fit.png")

# ---------------------------------------------------------
# SAVE SUMMARY
# ---------------------------------------------------------
results_path = os.path.join(MODEL_DIR, "bharatscore_regression_summary.csv")
results_df.to_csv(results_path)
print(f"💾 Saved comparison results to: {results_path}")
