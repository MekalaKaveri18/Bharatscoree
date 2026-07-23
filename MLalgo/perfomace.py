import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from xgboost import XGBClassifier
import matplotlib.pyplot as plt
import seaborn as sns

# ---------------- LOAD DATA ----------------
file_path = "C:/Users/HP/Downloads/final_cleaned_normalized.csv"

df = pd.read_csv(file_path)

# ---------------- CLEAN IDENTIFIERS ----------------
drop_cols = ['ID', 'Customer_ID', 'Month', 'Name', 'SSN']
df = df.drop(columns=[col for col in drop_cols if col in df.columns], errors='ignore')

# ---------------- ENCODE CATEGORICAL FEATURES ----------------
cat_cols = df.select_dtypes(include=['object']).columns
for col in cat_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))

# ---------------- DEFINE TARGET ----------------
target_candidates = ['target', 'default', 'is_default', 'loan_status', 'repayment_status', 'bad_loan', 'defaulter']
target_col = None
for cand in target_candidates:
    for c in df.columns:
        if cand.lower() in c.lower():
            target_col = c
            break
    if target_col:
        break

# Simulate target if not present
if target_col is None:
    print("⚠️ No explicit target found — simulating target for evaluation.")
    np.random.seed(42)
    df['target'] = np.random.randint(0, 2, len(df))
    target_col = 'target'

# ---------------- SPLIT DATA ----------------
X = df.drop(columns=[target_col])
y = df[target_col]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# ---------------- TRAIN MODEL ----------------
model = XGBClassifier(
    n_estimators=300,
    learning_rate=0.1,
    max_depth=6,
    random_state=42,
    eval_metric='logloss',
    use_label_encoder=False
)
model.fit(X_train, y_train)

# ---------------- PREDICT ----------------
y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)[:, 1]

# ---------------- EVALUATION ----------------
accuracy = accuracy_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_proba)
report = classification_report(y_test, y_pred, output_dict=True)
conf_matrix = confusion_matrix(y_test, y_pred)

print("\n📊 Model Performance Summary:")
print(f"Accuracy: {accuracy:.4f}")
print(f"ROC-AUC: {roc_auc:.4f}")
print(f"Precision (Class 1): {report['1']['precision']:.4f}")
print(f"Recall (Class 1): {report['1']['recall']:.4f}")
print(f"F1-Score (Class 1): {report['1']['f1-score']:.4f}")

# ---------------- CONFUSION MATRIX ----------------
plt.figure(figsize=(6,5))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
plt.title("Confusion Matrix - XGBoost Model")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.show()
