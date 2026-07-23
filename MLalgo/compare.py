# =========================================================
# BharatScore Full Visualization Suite — All Metrics & Models
# =========================================================
# Generates individual bar & pie charts for each metric across:
# XGBoost, RandomForest, Linear, Ridge, and Lasso regressions
# =========================================================

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

# ---------------- CONFIG ----------------
OUTPUT_DIR = r"C:\Users\HP\Downloads\BharatScoreModelOutputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------- MODEL PERFORMANCE DATA ----------------
CLASSIFIER_RESULTS = {
    "XGBoost": {"Accuracy": 0.9988, "ROC_AUC": 1.0000, "Precision": 0.9967, "Recall": 0.9992, "F1": 0.9979},
    "RandomForest": {"Accuracy": 0.9856, "ROC_AUC": 0.9997, "Precision": 0.9500, "Recall": 0.9900, "F1": 0.9700},
}
REGRESSION_RESULTS = {
    "LinearRegression": {"R2": 0.9414, "MAE": 19.88, "RMSE": 24.97},
    "RidgeRegression": {"R2": 0.9413, "MAE": 19.89, "RMSE": 24.99},
    "LassoRegression": {"R2": 0.9414, "MAE": 19.89, "RMSE": 24.98},
}

# ---------------- PREPARE UNIFIED DATA ----------------
clf_df = pd.DataFrame(CLASSIFIER_RESULTS).T
reg_df = pd.DataFrame(REGRESSION_RESULTS).T

# Treat R² as proxy performance metrics for regression models
reg_norm = reg_df.copy()
reg_norm["Accuracy"] = reg_norm["R2"]
reg_norm["ROC_AUC"] = reg_norm["R2"]
reg_norm["Precision"] = reg_norm["R2"]
reg_norm["Recall"] = reg_norm["R2"]
reg_norm["F1"] = reg_norm["R2"]

# Combine all
combined = pd.concat([
    clf_df[["Accuracy", "ROC_AUC", "Precision", "Recall", "F1"]],
    reg_norm[["Accuracy", "ROC_AUC", "Precision", "Recall", "F1"]]
])

sns.set(style="whitegrid")
highlight_color = "gold"

# =========================================================
# 1️⃣ CREATE COMBINED MULTI-METRIC BAR CHART
# =========================================================
plt.figure(figsize=(12, 8))
melted = combined.reset_index().melt(id_vars="index", var_name="Metric", value_name="Score")
sns.barplot(x="Metric", y="Score", hue="index", data=melted, palette="viridis")

plt.title("📊 BharatScore Model Family Performance Across Metrics", fontsize=16, weight="bold")
plt.ylabel("Score")
plt.xlabel("Performance Metric")
plt.ylim(0.8, 1.02)
plt.legend(title="Model", bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
combined_bar_path = os.path.join(OUTPUT_DIR, "bharatscore_combined_metrics_bar.png")
plt.savefig(combined_bar_path)
plt.close()
print(f"✅ Saved combined metrics bar chart: {combined_bar_path}")

# =========================================================
# 2️⃣ CREATE INDIVIDUAL BAR + PIE CHARTS FOR EACH METRIC
# =========================================================
metrics = ["Accuracy", "ROC_AUC", "Precision", "Recall", "F1"]

for metric in metrics:
    metric_values = combined[metric]
    models = combined.index

    # --- Bar Chart ---
    plt.figure(figsize=(8, 6))
    bars = sns.barplot(x=models, y=metric_values, palette="viridis")

    for p in bars.patches:
        bars.annotate(
            f"{p.get_height():.3f}",
            (p.get_x() + p.get_width() / 2., p.get_height()),
            ha='center', va='bottom', fontsize=9, color='black', weight='bold'
        )

    plt.title(f"📈 BharatScore — {metric} Comparison", fontsize=14, weight="bold")
    plt.xlabel("Model")
    plt.ylabel(metric)
    plt.ylim(0.8, 1.02)
    plt.xticks(rotation=25)
    plt.tight_layout()

    bar_path = os.path.join(OUTPUT_DIR, f"bharatscore_{metric.lower()}_bar.png")
    plt.savefig(bar_path)
    plt.close()

    # --- Pie Chart ---
    plt.figure(figsize=(7, 7))
    plt.pie(
        metric_values,
        labels=models,
        autopct="%1.1f%%",
        startangle=90,
        colors=sns.color_palette("viridis", len(models))
    )
    plt.title(f"🥧 BharatScore Model {metric} Distribution", fontsize=14, weight="bold")
    plt.tight_layout()

    pie_path = os.path.join(OUTPUT_DIR, f"bharatscore_{metric.lower()}_pie.png")
    plt.savefig(pie_path)
    plt.close()

    print(f"✅ Saved {metric} bar & pie charts.")

# =========================================================
# 3️⃣ EXPORT COMPARISON SUMMARY CSV
# =========================================================
summary_path = os.path.join(OUTPUT_DIR, "bharatscore_full_metrics_summary.csv")
combined.to_csv(summary_path)
print(f"💾 Exported summary metrics CSV: {summary_path}")

print("\n✨ All metric visualizations generated successfully!")
print(f"📁 Charts saved in: {OUTPUT_DIR}")
