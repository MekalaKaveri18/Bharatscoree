import pandas as pd

# path of your input and output CSV
inp = r"C:\Users\HP\Downloads\final.csv"
out = r"C:\Users\HP\Downloads\reordered_file.csv"

expected_order = [
            "Age",
            "Annual_Income",
            "Monthly_Inhand_Salary",
            "Num_Bank_Accounts",
            "Num_Credit_Card",
            "Interest_Rate",
            "Num_of_Loan",
            "Delay_from_due_date",
            "Num_of_Delayed_Payment",
            "Num_Credit_Inquiries",
            "Outstanding_Debt",
            "Credit_Utilization_Ratio",
            "Credit_History_Age",
            "Total_EMI_per_month",
            "Total_Debt",
            "Total_Assets",
            "Debt_to_Asset_Ratio",
            "Asset_to_Income_Ratio",
            "NetWorth_to_TotalAssets_Ratio",
            "Occupation",
            "Changed_Credit_Limit",
            "Credit_Mix",
            "Payment_of_Min_Amount",
            "Amount_invested_monthly",
            "Payment_Behaviour",
            "Monthly_Balance",
            "Type_of_Loan"
        
]

# load CSV
df = pd.read_csv(inp)

# drop extras if exist (like ID, SSN etc)
df = df[expected_order]

# save cleaned version
df.to_csv(out, index=False)

print("✅ Reordered and saved to:", out)
