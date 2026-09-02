// // import { useState, useRef, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Progress } from "@/components/ui/progress";
// // import {
// //   Upload,
// //   FileText,
// //   AlertCircle,
// //   CheckCircle,
// //   IdCard,
// //   Award,
// //   User,
// //   Loader2,
// // } from "lucide-react";
// // import { toast } from "sonner";
// // import axios from "axios";

// // interface BorrowerProfile {
// //   Age: number;
// //   Annual_Income: number;
// //   Monthly_Inhand_Salary: number;
// //   Num_Bank_Accounts: number;
// //   Num_Credit_Card: number;
// //   Interest_Rate: number;
// //   Num_of_Loan: number;
// //   Delay_from_due_date: number;
// //   Num_of_Delayed_Payment: number;
// //   Total_EMI_per_month: number;
// //   Total_Debt: number;
// //   Total_Assets: number;
// //   Debt_to_Asset_Ratio: number;
// //   Asset_to_Income_Ratio: number;
// //   NetWorth_to_TotalAssets_Ratio: number;
// //   Occupation: string;
// //   Amount_invested_monthly: string;
// //   Monthly_Balance: string;
// //   Type_of_Loan: string;
// // }

// // const BorrowerDashboard = () => {
// //   const navigate = useNavigate();

// //   const storedUser = localStorage.getItem("user");
// //   const user = storedUser ? JSON.parse(storedUser) : null;

// //   useEffect(() => {
// //     const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
// //     if (!isAuthenticated || !user) {
// //       navigate("/login");
// //     }
// //   }, [navigate, user]);

// //   const [profileComplete, setProfileComplete] = useState<boolean>(false);
// //   const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
// //   const [validatedDocs, setValidatedDocs] = useState<{ [key: string]: boolean }>({});
// //   const [creditScore, setCreditScore] = useState<number | null>(null);
// //   const [externalId, setExternalId] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(false);
// //   const [fetchingId, setFetchingId] = useState(true);
// //   const [formStep, setFormStep] = useState<"documents" | "details">("documents");
// //   const fileInputRef = useRef<HTMLInputElement>(null);

// //   const backendURL = "http://localhost:8000/api/v1";
// //   const token = localStorage.getItem("token");

// //   const [profileData, setProfileData] = useState<Partial<BorrowerProfile>>({
// //     Age: undefined,
// //     Annual_Income: undefined,
// //     Monthly_Inhand_Salary: undefined,
// //     Num_Bank_Accounts: undefined,
// //     Num_Credit_Card: undefined,
// //     Interest_Rate: undefined,
// //     Num_of_Loan: undefined,
// //     Delay_from_due_date: undefined,
// //     Num_of_Delayed_Payment: undefined,
// //     Total_EMI_per_month: undefined,
// //     Total_Debt: undefined,
// //     Total_Assets: undefined,
// //     Debt_to_Asset_Ratio: undefined,
// //     Asset_to_Income_Ratio: undefined,
// //     NetWorth_to_TotalAssets_Ratio: undefined,
// //     Occupation: "",
// //     Amount_invested_monthly: "",
// //     Monthly_Balance: "",
// //     Type_of_Loan: "",
// //   });

// //   const requiredDocuments = [
// //     "AADHAAR",
// //     "PAN",
// //     "BANK_STATEMENT",
// //     "LOAN_STATEMENT",
// //     "SALARY_SLIP",
// //     "UTILITY_BILL",
// //   ];

// //   useEffect(() => {
// //     const fetchExternalId = async () => {
// //       try {
// //         const res = await axios.get(`${backendURL}/borrowers/by_user`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //         });
// //         if (res.data?.external_id) {
// //           setExternalId(res.data.external_id);
// //         } else {
// //           toast.error("Borrower record not found.");
// //         }
// //       } catch (err: any) {
// //         const msg = err?.response?.data?.detail || "Error fetching borrower external ID.";
// //         toast.error(msg);
// //         console.error("fetchExternalId error:", err);
// //       } finally {
// //         setFetchingId(false);
// //       }
// //     };
// //     fetchExternalId();
// //   }, [token]);

// //   const detectDocType = (file: File): string | null => {
// //     const name = (file.name || "").toLowerCase();
// //     if (name.includes("aadhaar") || name.includes("aadhar")) return "AADHAAR";
// //     if (name.includes("pan")) return "PAN";
// //     if (name.includes("bank")) return "BANK_STATEMENT";
// //     if (name.includes("loan")) return "LOAN_STATEMENT";
// //     if (name.includes("salary") || name.includes("itr")) return "SALARY_SLIP";
// //     if (name.includes("bill") || name.includes("utility")) return "UTILITY_BILL";
// //     return null;
// //   };

// //   const handleFileUpload = async (documentType: string) => {
// //     if (!externalId) return toast.error("Borrower ID not loaded yet.");
// //     if (!fileInputRef.current) return;
// //     fileInputRef.current.value = "";
// //     fileInputRef.current.click();

// //     const backendDocMap: Record<string, string> = {
// //       BANK_STATEMENT: "bank_statement",
// //       LOAN_STATEMENT: "loan_statement",
// //       SALARY_SLIP: "salary_slip",
// //       UTILITY_BILL: "utility_bill",
// //       AADHAAR: "aadhaar",
// //       PAN: "pan",
// //     };

// //     fileInputRef.current.onchange = async (e: any) => {
// //       const file: File = e.target.files?.[0];
// //       if (!file) return;

// //       const detected = detectDocType(file);
// //       if (detected && detected !== documentType) {
// //         toast.error(`File type mismatch! Detected: ${detected} for ${documentType}`);
// //         setValidatedDocs((p) => ({ ...p, [documentType]: false }));
// //         return;
// //       }

// //       const backendDocType = backendDocMap[documentType];
// //       if (!backendDocType) {
// //         toast.error(`"${documentType}" upload type not recognized.`);
// //         return;
// //       }

// //       const formData = new FormData();
// //       formData.append("file", file);
// //       formData.append("doc_type", backendDocType);

// //       try {
// //         await axios.post(
// //           `${backendURL}/borrowers/${encodeURIComponent(externalId)}/upload`,
// //           formData,
// //           {
// //             headers: {
// //               Authorization: `Bearer ${token}`,
// //               "Content-Type": "multipart/form-data",
// //             },
// //           }
// //         );

// //         setUploadedFiles((prev) => [...new Set([...prev, documentType])]);
// //         setValidatedDocs((prev) => ({ ...prev, [documentType]: true }));
// //         toast.success(`${documentType} uploaded successfully!`);
// //       } catch (err: any) {
// //         const detail =
// //           err?.response?.data?.detail ||
// //           err?.response?.data?.message ||
// //           err.message ||
// //           "Upload failed.";
// //         toast.error(`Error uploading ${documentType}: ${detail}`);
// //         console.error("Upload error:", err);
// //       }
// //     };
// //   };

// //   const handleNextStep = () => {
// //     if (uploadedFiles.length < requiredDocuments.length) {
// //       toast.error("Please upload all required documents");
// //       return;
// //     }
// //     setFormStep("details");
// //     toast.success("Documents uploaded! Now fill in your details.");
// //   };

// //   const calculateDerivedFields = (data: Partial<BorrowerProfile>) => {
// //     const derived = { ...data };
// //     if (data.Total_Debt && data.Total_Assets) {
// //       derived.Debt_to_Asset_Ratio = data.Total_Debt / data.Total_Assets;
// //     }
// //     if (data.Total_Assets && data.Annual_Income) {
// //       derived.Asset_to_Income_Ratio = data.Total_Assets / data.Annual_Income;
// //     }
// //     if (data.Total_Assets && data.Total_Debt) {
// //       derived.NetWorth_to_TotalAssets_Ratio =
// //         (data.Total_Assets - data.Total_Debt) / data.Total_Assets;
// //     }
// //     return derived;
// //   };

// //   const allDocsValid =
// //     requiredDocuments.every((doc) => validatedDocs[doc]) &&
// //     uploadedFiles.length >= requiredDocuments.length;

// //   const handleCompleteProfile = async () => {
// //     if (!externalId) return toast.error("Borrower external ID not loaded yet");

// //     const finalData = calculateDerivedFields(profileData);
// //     if (!finalData.Age || !finalData.Annual_Income || !finalData.Occupation) {
// //       toast.error("Please fill in all required fields");
// //       return;
// //     }

// //     if (!allDocsValid) {
// //       toast.error("All required documents must be uploaded and valid before calculation");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       await axios.post(`${backendURL}/borrowers/${externalId}/profile`, finalData, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });

// //       const res = await axios.post(
// //         `${backendURL}/borrowers/${externalId}/calculate`,
// //         {},
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setCreditScore(res.data.score ?? res.data?.score_value ?? null);
// //       setProfileComplete(true);
// //       toast.success("BharatScore calculated successfully!");
// //     } catch (err: any) {
// //       const msg =
// //         err?.response?.data?.detail ||
// //         err?.response?.data?.message ||
// //         "Failed to calculate BharatScore";
// //       toast.error(msg);
// //       console.error("calculate error:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (fetchingId) {
// //     return (
// //       <div className="flex flex-col items-center justify-center h-screen">
// //         <Loader2 className="animate-spin text-primary" size={40} />
// //         <p className="mt-4 text-muted-foreground">Loading borrower details...</p>
// //       </div>
// //     );
// //   }

// //   function getScoreColor(score: number): string {
// //     if (!score && score !== 0) return "text-muted-foreground";
// //     if (score >= 750) return "text-secondary";
// //     if (score >= 700) return "text-accent";
// //     return "text-destructive";
// //   }

// //   function getScoreCategory(score: number): string {
// //     if (!score && score !== 0) return "No score";
// //     if (score >= 750) return "Excellent";
// //     if (score >= 700) return "Good";
// //     if (score >= 650) return "Fair";
// //     return "Poor";
// //   }

// //   // === FIXED: Dynamic engagement stats ===
// //   const computeEngagement = (score: number | null) => {
// //     if (!score) return { paymentHistory: 70, upiActivity: 65, billPayments: 68 };
// //     const base = Math.max(50, Math.min(90, Math.round(score / 10)));
// //     return {
// //       paymentHistory: base + 5,
// //       upiActivity: base - 2,
// //       billPayments: base + 3,
// //     };
// //   };

// //   const engagement = computeEngagement(creditScore);

// //   const getGamificationTips = (score: number | null): string[] => {
// //     if (!score) {
// //       return ["Complete your profile to unlock personalized score tips."];
// //     }
// //     if (score >= 750) {
// //       return [
// //         "Excellent score! Keep paying bills on time.",
// //         "Maintain active UPI transactions to strengthen credit history.",
// //         "Diversify your loan portfolio responsibly to reach 800+.",
// //       ];
// //     } else if (score >= 700) {
// //       return [
// //         "Continue making timely payments on all utility bills.",
// //         "Increase your UPI transaction frequency for everyday purchases.",
// //         "Maintain consistent rent payments and digital financial activity.",
// //       ];
// //     } else if (score >= 650) {
// //       return [
// //         "Pay pending bills on time to boost your score.",
// //         "Use UPI for daily payments to build transaction consistency.",
// //         "Lower your total debt to improve financial health.",
// //       ];
// //     }
// //     return [
// //       "Make timely payments to recover your credit health.",
// //       "Use UPI for small transactions to increase financial visibility.",
// //       "Avoid taking new loans until your score improves.",
// //     ];
// //   };

// //   return (
// //     <div className="container mx-auto px-4">
// //       <div className="mb-8 flex items-center justify-between">
// //         <div>
// //           <h1 className="text-4xl font-bold mb-2">Borrower Dashboard</h1>
// //           <p className="text-muted-foreground">
// //             Welcome back, {user?.name || user?.full_name || "User"}!
// //           </p>
// //         </div>
// //         <Button
// //           variant="outline"
// //           onClick={() => {
// //             localStorage.clear();
// //             toast.success("Logged out successfully!");
// //             navigate("/login");
// //           }}
// //         >
// //           Logout
// //         </Button>
// //       </div>

// //       {/* ID Card */}
// //       <Card className="p-6 mb-8 bg-gradient-hero text-white">
// //         <div className="flex items-center justify-between">
// //           <div>
// //             <div className="flex items-center gap-2 mb-2">
// //               <IdCard size={24} />
// //               <h2 className="text-xl font-bold">Your Borrower ID</h2>
// //             </div>
// //             <p className="text-3xl font-bold tracking-wider">{externalId || "—"}</p>
// //             <p className="text-white/80 text-sm mt-2">
// //               Share this ID with lenders to apply for loans
// //             </p>
// //           </div>
// //           <Button
// //             variant="outline"
// //             className="bg-white/10 hover:bg-white/20 text-white border-white/20"
// //             onClick={() => {
// //               if (externalId) {
// //                 navigator.clipboard.writeText(externalId);
// //                 toast.success("Borrower ID copied to clipboard!");
// //               } else {
// //                 toast.error("Borrower ID not available yet");
// //               }
// //             }}
// //           >
// //             Copy ID
// //           </Button>
// //         </div>
// //       </Card>

// //       {/* === Steps === */}
// //       {!profileComplete ? (
// //         <>
// //           {formStep === "documents" ? (
// //             <Card className="p-6">
// //               <div className="flex items-center gap-3 mb-6">
// //                 <AlertCircle className="text-accent" size={24} />
// //                 <div>
// //                   <h2 className="text-2xl font-bold">Step 1: Upload Documents</h2>
// //                   <p className="text-muted-foreground">
// //                     Upload required documents for verification
// //                   </p>
// //                 </div>
// //               </div>
// //               <Progress
// //                 value={(uploadedFiles.length / requiredDocuments.length) * 100}
// //                 className="mb-6"
// //               />
// //               <div className="grid md:grid-cols-2 gap-4 mb-6">
// //                 {requiredDocuments.map((doc) => (
// //                   <Card
// //                     key={doc}
// //                     className={`p-4 cursor-pointer transition-all ${
// //                       uploadedFiles.includes(doc)
// //                         ? "bg-secondary/10 border-secondary"
// //                         : "hover:bg-muted"
// //                     }`}
// //                     onClick={() =>
// //                       !uploadedFiles.includes(doc) && handleFileUpload(doc)
// //                     }
// //                   >
// //                     <div className="flex items-center justify-between">
// //                       <div className="flex items-center gap-3">
// //                         {uploadedFiles.includes(doc) ? (
// //                           <CheckCircle className="text-secondary" size={20} />
// //                         ) : (
// //                           <FileText className="text-muted-foreground" size={20} />
// //                         )}
// //                         <span className="font-medium text-sm">{doc}</span>
// //                       </div>
// //                       {!uploadedFiles.includes(doc) && (
// //                         <Upload size={18} className="text-muted-foreground" />
// //                       )}
// //                     </div>
// //                   </Card>
// //                 ))}
// //               </div>
// //               <input
// //                 ref={fileInputRef}
// //                 type="file"
// //                 className="hidden"
// //                 accept=".pdf,.jpg,.png"
// //               />
// //               <Button
// //                 onClick={handleNextStep}
// //                 disabled={uploadedFiles.length < requiredDocuments.length}
// //                 className="w-full bg-gradient-primary"
// //               >
// //                 Continue to Profile Details
// //               </Button>
// //             </Card>
// //           ) : (
// //             <Card className="p-6">
// //               <div className="flex items-center gap-3 mb-6">
// //                 <User className="text-accent" size={24} />
// //                 <div>
// //                   <h2 className="text-2xl font-bold">Step 2: Enter Your Details</h2>
// //                   <p className="text-muted-foreground">
// //                     Fill in your financial information
// //                   </p>
// //                 </div>
// //               </div>

// //               <div className="grid md:grid-cols-2 gap-6 mb-6">
// //                 {Object.entries({
// //                   Age: "Age *",
// //                   Occupation: "Occupation *",
// //                   Annual_Income: "Annual Income (₹) *",
// //                   Monthly_Inhand_Salary: "Monthly In-hand Salary (₹)",
// //                   Num_Bank_Accounts: "Number of Bank Accounts",
// //                   Num_Credit_Card: "Number of Credit Cards",
// //                   Interest_Rate: "Interest Rate (%)",
// //                   Num_of_Loan: "Number of Loans",
// //                   Delay_from_due_date: "Delay From Due Date (days)",
// //                   Num_of_Delayed_Payment: "Number of Delayed Payments",
// //                   Total_EMI_per_month: "Total EMI per Month (₹)",
// //                   Total_Debt: "Total Debt (₹)",
// //                   Total_Assets: "Total Assets (₹)",
// //                   Amount_invested_monthly: "Amount Invested Monthly (₹)",
// //                   Monthly_Balance: "Monthly Balance (₹)",
// //                   Type_of_Loan: "Type of Loan",
// //                 }).map(([key, label]) => (
// //                   <div key={key}>
// //                     <Label htmlFor={key}>{label}</Label>
// //                     <Input
// //                       id={key}
// //                       type={
// //                         ["Occupation", "Type_of_Loan"].includes(key)
// //                           ? "text"
// //                           : "number"
// //                       }
// //                       value={(profileData as any)[key] ?? ""}
// //                       onChange={(e) =>
// //                         setProfileData({
// //                           ...profileData,
// //                           [key]:
// //                             ["Occupation", "Type_of_Loan"].includes(key)
// //                               ? e.target.value
// //                               : e.target.value === ""
// //                               ? 0
// //                               : Number(e.target.value),
// //                         })
// //                       }
// //                     />
// //                   </div>
// //                 ))}
// //               </div>

// //               <div className="flex gap-4">
// //                 <Button
// //                   variant="outline"
// //                   onClick={() => setFormStep("documents")}
// //                   className="flex-1"
// //                 >
// //                   Back to Documents
// //                 </Button>
// //                 <Button
// //                   onClick={handleCompleteProfile}
// //                   disabled={loading || !allDocsValid}
// //                   className="flex-1 bg-gradient-primary"
// //                 >
// //                   {loading ? (
// //                     <>
// //                       <Loader2 className="animate-spin mr-2" size={16} /> Calculating...
// //                     </>
// //                   ) : (
// //                     "Calculate My BharatScore"
// //                   )}
// //                 </Button>
// //               </div>
// //             </Card>
// //           )}
// //         </>
// //       ) : (
// //         <>
// //           <Card className="p-8 text-center mb-6">
// //             <div className="flex items-center justify-center gap-3 mb-4">
// //               <Award className="text-primary" size={32} />
// //               <h2 className="text-3xl font-bold">Your BharatScore</h2>
// //             </div>
// //             <div
// //               className={`text-7xl font-bold ${
// //                 creditScore !== null
// //                   ? getScoreColor(creditScore)
// //                   : "text-muted-foreground"
// //               } mb-4`}
// //             >
// //               {creditScore ?? "—"}
// //             </div>
// //             <div className="text-2xl font-semibold mb-2">
// //               {creditScore !== null
// //                 ? getScoreCategory(creditScore)
// //                 : "Not available"}
// //             </div>
// //             <Progress
// //               value={creditScore ? (creditScore / 900) * 100 : 0}
// //               className="mb-4"
// //             />
// //             <p className="text-muted-foreground">Score Range: 300 - 900</p>
// //           </Card>

// //           {/* === GAMIFICATION SECTION === */}
// //           <div className="grid md:grid-cols-3 gap-6 mb-6">
// //             <Card className="p-6 text-center">
// //               <h3 className="text-lg font-semibold mb-2">Payment History</h3>
// //               <div className="text-4xl font-bold text-secondary mb-1">
// //                 {engagement.paymentHistory}%
// //               </div>
// //               <p className="text-muted-foreground">Consistent payment record</p>
// //             </Card>
// //             <Card className="p-6 text-center">
// //               <h3 className="text-lg font-semibold mb-2">UPI Activity</h3>
// //               <div className="text-4xl font-bold text-secondary mb-1">
// //                 {engagement.upiActivity}%
// //               </div>
// //               <p className="text-muted-foreground">Active digital transactions</p>
// //             </Card>
// //             <Card className="p-6 text-center">
// //               <h3 className="text-lg font-semibold mb-2">Bill Payments</h3>
// //               <div className="text-4xl font-bold text-secondary mb-1">
// //                 {engagement.billPayments}%
// //               </div>
// //               <p className="text-muted-foreground">Regular utility payments</p>
// //             </Card>
// //           </div>

// //           <Card className="p-6">
// //             <h3 className="text-2xl font-bold mb-3">Tips to Improve Your Score</h3>
// //             <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
// //               {getGamificationTips(creditScore).map((tip, idx) => (
// //                 <li key={idx}>{tip}</li>
// //               ))}
// //             </ul>
// //           </Card>
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default BorrowerDashboard;





// //** new code phase-2 *//
// // import { useEffect, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Progress } from "@/components/ui/progress";
// // import { Input } from "@/components/ui/input";
// // import {
// //   IdCard,
// //   Upload,
// //   CheckCircle,
// //   AlertCircle,
// //   Award,
// // } from "lucide-react";
// // import { toast } from "sonner";

// // /* -------------------- TYPES -------------------- */

// // interface KYCStatus {
// //   aadhaarVerified: boolean;
// //   panVerified: boolean;
// //   digilockerLinked: boolean;
// //   nameMatch: boolean;
// // }

// // /* -------------------- CONFIG -------------------- */

// // const backendURL = "http://localhost:8000/api/v1";

// // /* -------------------- COMPONENT -------------------- */

// // const BorrowerDashboard = () => {
// //   const navigate = useNavigate();
// //   const token = localStorage.getItem("token");
// //   const fileInputRef = useRef<HTMLInputElement>(null);

// //   const [externalId, setExternalId] = useState<string | null>(null);
// //   const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
// //   const [creditScore, setCreditScore] = useState<number | null>(null);
// //   const [futureRisk, setFutureRisk] = useState<number | null>(null);
// //   const [loadingScore, setLoadingScore] = useState(false);

// //   /* ---------- OTP STATE ---------- */
// //   const [aadhaarTxnId, setAadhaarTxnId] = useState<string | null>(null);
// //   const [otp, setOtp] = useState("");
// //   const [showOtp, setShowOtp] = useState(false);
// //   const [verifyingOtp, setVerifyingOtp] = useState(false);

// //   const [kyc, setKyc] = useState<KYCStatus>({
// //     aadhaarVerified: false,
// //     panVerified: false,
// //     digilockerLinked: false,
// //     nameMatch: true,
// //   });

// //   /* -------------------- AUTH -------------------- */

// //   useEffect(() => {
// //     if (!token) navigate("/login");
// //   }, [token, navigate]);

// //   /* -------------------- BORROWER ID -------------------- */

// //   useEffect(() => {
// //     axios
// //       .get(`${backendURL}/borrowers/by_user`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       })
// //       .then((res) => setExternalId(res.data.external_id))
// //       .catch(() => toast.error("Failed to load borrower ID"));
// //   }, [token]);

// //   /* -------------------- AADHAAR (STEP 1) -------------------- */

// //   const initiateAadhaar = async () => {
// //     try {
// //       const res = await axios.post(
// //         `${backendURL}/kyc/aadhaar/initiate`,
// //         {},
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setAadhaarTxnId(res.data.transaction_id);
// //       setShowOtp(true);
// //       toast.success("OTP sent (simulated: 123456)");
// //     } catch (err: any) {
// //       toast.error(err?.response?.data?.detail || "Aadhaar initiation failed");
// //     }
// //   };

// //   /* -------------------- AADHAAR OTP VERIFY (STEP 2) -------------------- */

// //   const verifyAadhaarOtp = async () => {
// //     if (!aadhaarTxnId) return;

// //     setVerifyingOtp(true);
// //     try {
// //       await axios.post(
// //         `${backendURL}/kyc/aadhaar/verify`,
// //         { transaction_id: aadhaarTxnId, otp },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setKyc((p) => ({ ...p, aadhaarVerified: true }));
// //       setShowOtp(false);
// //       setOtp("");
// //       toast.success("Aadhaar verified successfully");
// //     } catch {
// //       toast.error("Invalid OTP");
// //     } finally {
// //       setVerifyingOtp(false);
// //     }
// //   };

// //   /* -------------------- PAN -------------------- */

// //   const verifyPAN = async () => {
// //     try {
// //       const res = await axios.post(
// //         `${backendURL}/kyc/pan/verify`,
// //         { pan_number: "ABCDE1234F", full_name: "Demo User" },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setKyc((p) => ({
// //         ...p,
// //         panVerified: true,
// //         nameMatch: res.data.name_match,
// //       }));

// //       toast.success("PAN verified");
// //     } catch (err: any) {
// //       toast.error(err?.response?.data?.detail || "PAN verification failed");
// //     }
// //   };

// //   /* -------------------- DIGILOCKER -------------------- */

// //   const linkDigiLocker = async () => {
// //   try {
// //     // MVP simulation (no OAuth)
// //     await axios.get(`${backendURL}/digilocker/status`, {
// //       headers: { Authorization: `Bearer ${token}` },
// //     });

// //     setKyc((p) => ({ ...p, digilockerLinked: true }));
// //     toast.success("DigiLocker linked (simulated)");
// //   } catch {
// //     // ✅ Even if backend fails, allow MVP flow
// //     setKyc((p) => ({ ...p, digilockerLinked: true }));
// //     toast.success("DigiLocker linked (simulated)");
// //   }
// // };


// //   /* -------------------- HARD BLOCK -------------------- */

// //   if (!kyc.nameMatch) {
// //     return (
// //       <div className="container mx-auto px-4 mt-10">
// //         <Card className="p-6 border-destructive">
// //           <AlertCircle className="text-destructive mb-2" />
// //           Aadhaar & PAN do not belong to the same individual.
// //         </Card>
// //       </div>
// //     );
// //   }

// //   const kycComplete =
// //     kyc.aadhaarVerified &&
// //     kyc.panVerified &&
// //     kyc.digilockerLinked;

// //   /* -------------------- DOCUMENT UPLOAD -------------------- */

// //   const allowedDocs = [
// //     "BANK_STATEMENT",
// //     "LOAN_STATEMENT",
// //     "SALARY_SLIP",
// //     "UTILITY_BILL",
// //   ];

// //   const uploadDoc = (docType: string) => {
// //     if (!fileInputRef.current || !externalId) return;
// //     fileInputRef.current.click();

// //     fileInputRef.current.onchange = async (e: any) => {
// //       const file = e.target.files?.[0];
// //       if (!file) return;

// //       const form = new FormData();
// //       form.append("file", file);
// //       form.append("doc_type", docType.toLowerCase());

// //       await axios.post(
// //         `${backendURL}/borrowers/${externalId}/upload`,
// //         form,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setUploadedDocs((p) => [...new Set([...p, docType])]);
// //       toast.success(`${docType} uploaded`);
// //     };
// //   };

// //   /* -------------------- SCORE -------------------- */

// //   const calculateScore = async () => {
// //     if (!externalId) return;
// //     setLoadingScore(true);

// //     try {
// //       const res = await axios.post(
// //         `${backendURL}/borrowers/${externalId}/calculate`,
// //         {},
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setCreditScore(res.data.score);
// //       toast.success("BharatScore calculated");
// //     } catch (e: any) {
// //       toast.error(e?.response?.data?.detail || "Score calculation failed");
// //     } finally {
// //       setLoadingScore(false);
// //     }
// //   };

// //   /* -------------------- LSTM -------------------- */

// //   useEffect(() => {
// //     axios
// //       .get(`${backendURL}/ml/lstm/payment-risk`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       })
// //       .then((res) => setFutureRisk(res.data.default_probability));
// //   }, []);

// //   /* -------------------- UI -------------------- */

// //   return (
// //     <div className="container mx-auto px-4">
// //       <h1 className="text-4xl font-bold mb-6">Borrower Dashboard</h1>

// //       <Card className="p-6 mb-6">
// //         <IdCard className="mb-2" />
// //         <p className="text-xl font-bold">{externalId || "—"}</p>
// //       </Card>

// //       {/* KYC */}
// //       <Card className="p-6 mb-6">
// //         <h2 className="text-xl font-bold mb-4">Identity Verification</h2>

// //         <Button onClick={initiateAadhaar} disabled={kyc.aadhaarVerified}>
// //           {kyc.aadhaarVerified ? "Aadhaar Verified" : "Verify Aadhaar"}
// //         </Button>

// //         {showOtp && (
// //           <div className="mt-4 max-w-xs space-y-2">
// //             <Input
// //               placeholder="Enter OTP (123456)"
// //               value={otp}
// //               onChange={(e) => setOtp(e.target.value)}
// //             />
// //             <Button onClick={verifyAadhaarOtp} disabled={verifyingOtp}>
// //               {verifyingOtp ? "Verifying..." : "Verify OTP"}
// //             </Button>
// //           </div>
// //         )}

// //         <Button
// //           onClick={verifyPAN}
// //           disabled={!kyc.aadhaarVerified || kyc.panVerified}
// //           className="ml-2"
// //         >
// //           Verify PAN
// //         </Button>

// //         <Button
// //           onClick={linkDigiLocker}
// //           disabled={!kyc.panVerified || kyc.digilockerLinked}
// //           className="ml-2"
// //         >
// //           Link DigiLocker
// //         </Button>
// //       </Card>

// //       {!kycComplete && (
// //         <Card className="p-4 mb-6">
// //           <AlertCircle className="inline mr-2" />
// //           Complete KYC to proceed.
// //         </Card>
// //       )}

// //       <Card className="p-6 mb-6">
// //         <h2 className="text-xl font-bold mb-4">Financial Documents</h2>

// //         <Progress
// //           value={(uploadedDocs.length / allowedDocs.length) * 100}
// //           className="mb-4"
// //         />

// //         {allowedDocs.map((doc) => (
// //           <Button
// //             key={doc}
// //             variant="outline"
// //             className="mr-2 mb-2"
// //             onClick={() => uploadDoc(doc)}
// //             disabled={!kycComplete || uploadedDocs.includes(doc)}
// //           >
// //             {uploadedDocs.includes(doc) ? (
// //               <CheckCircle className="mr-1" />
// //             ) : (
// //               <Upload className="mr-1" />
// //             )}
// //             {doc}
// //           </Button>
// //         ))}
// //       </Card>

// //       <Button
// //         className="w-full mb-6"
// //         onClick={calculateScore}
// //         disabled={!kycComplete || uploadedDocs.length < 4 || loadingScore}
// //       >
// //         {loadingScore ? "Calculating..." : "Calculate BharatScore"}
// //       </Button>

// //       {creditScore !== null && (
// //         <Card className="p-6 mb-6 text-center">
// //           <Award className="mx-auto mb-2" />
// //           <p className="text-5xl font-bold">{creditScore}</p>
// //           <p className="text-muted-foreground">BharatScore</p>
// //         </Card>
// //       )}

// //       {futureRisk !== null && (
// //         <Card className="p-6 text-center">
// //           Future Default Risk (LSTM): {(futureRisk * 100).toFixed(2)}%
// //         </Card>
// //       )}

// //       <input ref={fileInputRef} type="file" hidden />
// //     </div>
// //   );
// // };

// // export default BorrowerDashboard;
// // import { useEffect, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { Card } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Progress } from "@/components/ui/progress";
// // import { Input } from "@/components/ui/input";
// // import {
// //   IdCard,
// //   Upload,
// //   CheckCircle,
// //   AlertCircle,
// //   Award,
// //   LogOut,
// // } from "lucide-react";
// // import { toast } from "sonner";

// // /* ---------------- TYPES ---------------- */
// // interface KYCStatus {
// //   aadhaarVerified: boolean;
// //   panVerified: boolean;
// //   digilockerLinked: boolean;
// //   nameMatch: boolean;
// // }

// // /* ---------------- CONFIG ---------------- */
// // const backendURL = "http://localhost:8000/api/v1";

// // /* ---------------- COMPONENT ---------------- */
// // const BorrowerDashboard = () => {
// //   const navigate = useNavigate();
// //   const token = localStorage.getItem("token");
// //   const fileInputRef = useRef<HTMLInputElement>(null);

// //   const [externalId, setExternalId] = useState<string | null>(null);
// //   const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
// //   const [creditScore, setCreditScore] = useState<number | null>(null);
// //   const [loadingScore, setLoadingScore] = useState(false);

// //   /* Aadhaar OTP */
// //   const [aadhaarTxnId, setAadhaarTxnId] = useState<string | null>(null);
// //   const [otp, setOtp] = useState("");
// //   const [showOtp, setShowOtp] = useState(false);

// //   const [kyc, setKyc] = useState<KYCStatus>({
// //     aadhaarVerified: false,
// //     panVerified: false,
// //     digilockerLinked: false,
// //     nameMatch: true,
// //   });

// //   /* ---------------- AUTH ---------------- */
// //   useEffect(() => {
// //     if (!token) navigate("/login");
// //   }, [token, navigate]);

// //   /* ---------------- LOGOUT ---------------- */
// //   const logout = () => {
// //     localStorage.clear();
// //     toast.success("Logged out successfully");
// //     navigate("/login");
// //   };

// //   /* ---------------- BORROWER ID ---------------- */
// //   useEffect(() => {
// //     axios
// //       .get(`${backendURL}/borrowers/by_user`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       })
// //       .then((res) => setExternalId(res.data.external_id))
// //       .catch(() => toast.error("Failed to load borrower ID"));
// //   }, [token]);

// //   /* ---------------- AADHAAR OTP ---------------- */
// //   const initiateAadhaar = async () => {
// //     const res = await axios.post(
// //       `${backendURL}/kyc/aadhaar/initiate`,
// //       {},
// //       { headers: { Authorization: `Bearer ${token}` } }
// //     );
// //     setAadhaarTxnId(res.data.transaction_id);
// //     setShowOtp(true);
// //     toast.success("OTP sent (use 123456)");
// //   };

// //   const verifyAadhaarOtp = async () => {
// //     if (!aadhaarTxnId || otp.length !== 6) return;

// //     try {
// //       await axios.post(
// //         `${backendURL}/kyc/aadhaar/verify`,
// //         { transaction_id: aadhaarTxnId, otp },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       setKyc((p) => ({ ...p, aadhaarVerified: true }));
// //       setShowOtp(false);
// //       setOtp("");
// //       toast.success("Aadhaar verified");
// //     } catch (err: any) {
// //       toast.error(err?.response?.data?.detail || "OTP verification failed");
// //     }
// //   };

// //   /* ---------------- PAN OCR + VERIFY ---------------- */
// //   const selectPanImage = () => {
// //     if (!fileInputRef.current) return;

// //     fileInputRef.current.value = "";
// //     fileInputRef.current.click();

// //     fileInputRef.current.onchange = async (e: any) => {
// //       const file: File = e.target.files?.[0];
// //       if (!file) return;

// //       const form = new FormData();
// //       form.append("file", file);

// //       const ocrRes = await axios.post(
// //         `${backendURL}/kyc/pan/ocr`,
// //         form,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       const verifyRes = await axios.post(
// //         `${backendURL}/kyc/pan/verify`,
// //         {
// //           pan_number: ocrRes.data.pan_number,
// //           full_name: ocrRes.data.full_name,
// //         },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setKyc((p) => ({
// //         ...p,
// //         panVerified: true,
// //         nameMatch: verifyRes.data.name_match,
// //       }));

// //       toast.success("PAN verified");
// //     };
// //   };

// //   /* ---------------- DIGILOCKER ---------------- */
// //   const linkDigiLocker = () => {
// //     setKyc((p) => ({ ...p, digilockerLinked: true }));
// //     toast.success("DigiLocker linked");
// //   };

// //   if (!kyc.nameMatch) {
// //     return (
// //       <Card className="p-6 border-destructive mt-10">
// //         <AlertCircle className="text-destructive mb-2" />
// //         Aadhaar & PAN mismatch
// //       </Card>
// //     );
// //   }

// //   const kycComplete =
// //     kyc.aadhaarVerified && kyc.panVerified && kyc.digilockerLinked;

// //   /* ---------------- FINANCIAL DOCS ---------------- */
// //   const allowedDocs = [
// //     "BANK_STATEMENT",
// //     "SALARY_SLIP",
// //     "LOAN_STATEMENT",
// //     "UTILITY_BILL",
// //   ];

// //   const uploadDoc = (doc: string) => {
// //     if (!fileInputRef.current || !externalId || !kycComplete) return;

// //     fileInputRef.current.value = "";
// //     fileInputRef.current.click();

// //     fileInputRef.current.onchange = async (e: any) => {
// //       const file = e.target.files?.[0];
// //       if (!file) return;

// //       const form = new FormData();
// //       form.append("file", file);
// //       form.append("doc_type", doc.toLowerCase());

// //       await axios.post(
// //         `${backendURL}/borrowers/${externalId}/upload`,
// //         form,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       setUploadedDocs((p) => [...new Set([...p, doc])]);
// //       toast.success(`${doc} uploaded`);
// //     };
// //   };

// //   const allDocsUploaded = allowedDocs.every((d) =>
// //     uploadedDocs.includes(d)
// //   );

// //   /* ---------------- SCORE ---------------- */
// //   const calculateScore = async () => {
// //     if (!kycComplete || !allDocsUploaded) {
// //       toast.error("Complete KYC & upload all documents");
// //       return;
// //     }

// //     setLoadingScore(true);
// //     const res = await axios.post(
// //       `${backendURL}/borrowers/${externalId}/calculate`,
// //       {},
// //       { headers: { Authorization: `Bearer ${token}` } }
// //     );
// //     setCreditScore(res.data.score);
// //     setLoadingScore(false);
// //   };

// //   /* ---------------- SCORE INSIGHTS ---------------- */
// //   const engagement =
// //     creditScore >= 750
// //       ? { p: 92, u: 88, b: 90 }
// //       : creditScore >= 700
// //       ? { p: 85, u: 78, b: 82 }
// //       : creditScore >= 650
// //       ? { p: 75, u: 68, b: 72 }
// //       : { p: 60, u: 55, b: 58 };

// //   const tips =
// //     creditScore && creditScore >= 700
// //       ? [
// //           "Continue making timely payments on all utility bills",
// //           "Increase your UPI transaction frequency for everyday purchases",
// //           "Maintain consistent rent payments and digital activity",
// //         ]
// //       : [
// //           "Pay dues on time to improve your score",
// //           "Use UPI regularly for small transactions",
// //           "Avoid taking new loans until your score improves",
// //         ];

// //   /* ---------------- UI ---------------- */
// //   return (
// //     <div className="container mx-auto px-4">
// //       <div className="flex justify-between mb-6">
// //         <h1 className="text-4xl font-bold">Borrower Dashboard</h1>
// //         <Button onClick={logout} variant="outline">
// //           <LogOut className="mr-2" size={16} /> Logout
// //         </Button>
// //       </div>

// //       <Card className="p-6 mb-6">
// //         <IdCard />
// //         <p className="text-xl font-bold">{externalId}</p>
// //       </Card>

// //       {/* KYC */}
// //       <Card className="p-6 mb-6">
// //         <Button onClick={initiateAadhaar} disabled={kyc.aadhaarVerified}>
// //           Aadhaar OTP Verify
// //         </Button>

// //         {showOtp && (
// //           <div className="mt-4 max-w-xs space-y-2">
// //             <Input
// //               value={otp}
// //               maxLength={6}
// //               placeholder="Enter 6-digit OTP"
// //               inputMode="numeric"
// //               onChange={(e) =>
// //                 setOtp(e.target.value.replace(/\D/g, ""))
// //               }
// //             />
// //             <Button
// //               onClick={verifyAadhaarOtp}
// //               disabled={!aadhaarTxnId || otp.length !== 6}
// //             >
// //               Verify OTP
// //             </Button>
// //           </div>
// //         )}

// //         <Button
// //           onClick={selectPanImage}
// //           disabled={!kyc.aadhaarVerified || kyc.panVerified}
// //           className="ml-2"
// //         >
// //           Select PAN Image
// //         </Button>

// //         <Button
// //           onClick={linkDigiLocker}
// //           disabled={!kyc.panVerified || kyc.digilockerLinked}
// //           className="ml-2"
// //         >
// //           Link DigiLocker
// //         </Button>
// //       </Card>

// //       {/* Documents */}
// //       <Card className="p-6 mb-6">
// //         <Progress value={(uploadedDocs.length / allowedDocs.length) * 100} />
// //         {allowedDocs.map((d) => (
// //           <Button
// //             key={d}
// //             className="mr-2 mt-2"
// //             onClick={() => uploadDoc(d)}
// //             disabled={!kycComplete || uploadedDocs.includes(d)}
// //           >
// //             {uploadedDocs.includes(d) ? <CheckCircle /> : <Upload />} {d}
// //           </Button>
// //         ))}
// //       </Card>

// //       <Button onClick={calculateScore} disabled={loadingScore}>
// //         Calculate BharatScore
// //       </Button>

// //       {creditScore && (
// //         <>
// //           <Card className="p-6 mt-6 text-center">
// //             <Award />
// //             <p className="text-5xl font-bold">{creditScore}</p>
// //           </Card>

// //           <div className="grid md:grid-cols-3 gap-6 mt-6">
// //             <Card className="p-6 text-center">
// //               <h3>Payment History</h3>
// //               <p className="text-3xl font-bold">{engagement.p}%</p>
// //               <p className="text-muted-foreground">Payment track record</p>
// //             </Card>
// //             <Card className="p-6 text-center">
// //               <h3>UPI Activity</h3>
// //               <p className="text-3xl font-bold">{engagement.u}%</p>
// //               <p className="text-muted-foreground">
// //                 High transaction frequency
// //               </p>
// //             </Card>
// //             <Card className="p-6 text-center">
// //               <h3>Bill Payments</h3>
// //               <p className="text-3xl font-bold">{engagement.b}%</p>
// //               <p className="text-muted-foreground">
// //                 Consistent utility payments
// //               </p>
// //             </Card>
// //           </div>

// //           <Card className="p-6 mt-6">
// //             <h3 className="text-2xl font-bold mb-3">
// //               Tips to Improve Your Score
// //             </h3>
// //             <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
// //               {tips.map((t, i) => (
// //                 <li key={i}>{t}</li>
// //               ))}
// //             </ul>
// //           </Card>
// //         </>
// //       )}

// //       <input
// //         ref={fileInputRef}
// //         type="file"
// //         accept=".pdf,.jpg,.jpeg,.png"
// //         hidden
// //       />
// //     </div>
// //   );
// // };

// // export default BorrowerDashboard;
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import { Input } from "@/components/ui/input";
// import {
//   IdCard,
//   Upload,
//   CheckCircle,
//   AlertCircle,
//   Award,
//   LogOut,
//   Info,
// } from "lucide-react";
// import { toast } from "sonner";

// /* ---------------- TYPES ---------------- */
// interface KYCStatus {
//   aadhaarVerified: boolean;
//   panVerified: boolean;
//   digilockerLinked: boolean;
//   nameMatch: boolean;
// }

// interface ScoreExplanation {
//   category: "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT";
//   reasons: string[];
//   tips: string[];
// }

// /* ---------------- CONFIG ---------------- */
// const backendURL = "http://localhost:8000/api/v1";

// /* ---------------- COMPONENT ---------------- */
// const BorrowerDashboard = () => {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [externalId, setExternalId] = useState<string | null>(null);
//   const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
//   const [creditScore, setCreditScore] = useState<number | null>(null);
//   const [explanation, setExplanation] = useState<ScoreExplanation | null>(null);
//   const [loadingScore, setLoadingScore] = useState(false);

//   /* Aadhaar */
//   const [aadhaarNumber, setAadhaarNumber] = useState("");
//   const [aadhaarTxnId, setAadhaarTxnId] = useState<string | null>(null);
//   const [otp, setOtp] = useState("");
//   const [showOtp, setShowOtp] = useState(false);

//   /* PAN */
//   const [panNumber, setPanNumber] = useState("");
//   const [panName, setPanName] = useState("");

//   const [kyc, setKyc] = useState<KYCStatus>({
//     aadhaarVerified: false,
//     panVerified: false,
//     digilockerLinked: false,
//     nameMatch: true,
//   });

//   /* ---------------- AUTH ---------------- */
//   useEffect(() => {
//     if (!token) navigate("/login");
//   }, [token, navigate]);

//   const logout = () => {
//     localStorage.clear();
//     toast.success("Logged out successfully");
//     navigate("/login");
//   };

//   /* ---------------- BORROWER ID ---------------- */
//   useEffect(() => {
//     axios
//       .get(`${backendURL}/borrowers/by_user`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setExternalId(res.data.external_id))
//       .catch(() => toast.error("Failed to load borrower ID"));
//   }, [token]);

//   /* ---------------- AADHAAR ---------------- */
//   const initiateAadhaar = async () => {
//     if (!/^\d{12}$/.test(aadhaarNumber)) {
//       toast.error("Enter valid 12‑digit Aadhaar number");
//       return;
//     }

//     const res = await axios.post(
//       `${backendURL}/kyc/aadhaar/initiate`,
//       { aadhaar_number: aadhaarNumber },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     setAadhaarTxnId(res.data.transaction_id);
//     setShowOtp(true);
//     toast.success("OTP sent (123456)");
//   };

//   const verifyAadhaarOtp = async () => {
//     if (!aadhaarTxnId || otp.length !== 6) return;

//     await axios.post(
//       `${backendURL}/kyc/aadhaar/verify`,
//       { transaction_id: aadhaarTxnId, otp },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );

//     setKyc((p) => ({ ...p, aadhaarVerified: true }));
//     setShowOtp(false);
//     setOtp("");
//     toast.success("Aadhaar verified");
//   };

//   /* ---------------- PAN ---------------- */
//   const verifyPan = async () => {
//     if (!panNumber || !panName) {
//       toast.error("Enter PAN number and full name");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${backendURL}/kyc/pan/verify`,
//         {
//           pan_number: panNumber.toUpperCase(),
//           full_name: panName,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       setKyc((p) => ({
//         ...p,
//         panVerified: true,
//         nameMatch: res.data.name_match,
//       }));

//       toast.success("PAN verified");
//     } catch (e: any) {
//       toast.error(e?.response?.data?.detail || "PAN verification failed");
//     }
//   };

//   /* ---------------- DIGILOCKER ---------------- */
//   const linkDigiLocker = () => {
//     setKyc((p) => ({ ...p, digilockerLinked: true }));
//     toast.success("DigiLocker linked");
//   };

//   if (!kyc.nameMatch) {
//     return (
//       <Card className="p-6 border-destructive mt-10">
//         <AlertCircle className="text-destructive mb-2" />
//         Aadhaar & PAN mismatch
//       </Card>
//     );
//   }

//   const kycComplete =
//     kyc.aadhaarVerified && kyc.panVerified && kyc.digilockerLinked;

//   /* ---------------- DOCUMENT UPLOAD ---------------- */
//   const allowedDocs = [
//     "BANK_STATEMENT",
//     "SALARY_SLIP",
//     "LOAN_STATEMENT",
//     "UTILITY_BILL",
//   ];

//   const uploadDoc = (doc: string) => {
//     if (!kycComplete || !externalId) return;

//     fileInputRef.current!.value = "";
//     fileInputRef.current!.click();

//     fileInputRef.current!.onchange = async (e: any) => {
//       const file = e.target.files?.[0];
//       if (!file) return;

//       const form = new FormData();
//       form.append("file", file);
//       form.append("doc_type", doc.toLowerCase());

//       try {
//         const res = await axios.post(
//           `${backendURL}/borrowers/${externalId}/upload`,
//           form,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setUploadedDocs((p) => [...new Set([...p, doc])]);
//         toast.success(res.data.message);
//       } catch (err: any) {
//         toast.error(err.response?.data?.detail || "Upload failed");
//       }
//     };
//   };

//   /* ---------------- SCORE ---------------- */
//   const calculateScore = async () => {
//     if (!kycComplete || uploadedDocs.length < 4) {
//       toast.error("Complete KYC & upload all documents");
//       return;
//     }

//     setLoadingScore(true);
//     try {
//       const res = await axios.post(
//         `${backendURL}/borrowers/${externalId}/calculate`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setCreditScore(res.data.score);
//       setExplanation(res.data.explanation);
//     } catch (e: any) {
//       toast.error(e.response?.data?.detail);
//     }
//     setLoadingScore(false);
//   };

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="container mx-auto px-4">
//       <div className="flex justify-between mb-6">
//         <h1 className="text-4xl font-bold">Borrower Dashboard</h1>
//         <Button onClick={logout} variant="outline">
//           <LogOut className="mr-2" size={16} /> Logout
//         </Button>
//       </div>

//       <Card className="p-6 mb-6">
//         <IdCard className="mb-2" />
//         <p className="text-xl font-bold">{externalId}</p>
//       </Card>

//       {/* KYC */}
//       <Card className="p-6 mb-6 space-y-3">
//         <Input
//           placeholder="Aadhaar Number"
//           maxLength={12}
//           value={aadhaarNumber}
//           onChange={(e) =>
//             setAadhaarNumber(e.target.value.replace(/\D/g, ""))
//           }
//           disabled={kyc.aadhaarVerified}
//         />

//         <Button onClick={initiateAadhaar} disabled={kyc.aadhaarVerified}>
//           Verify Aadhaar
//         </Button>

//         {showOtp && (
//           <>
//             <Input
//               maxLength={6}
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//             />
//             <Button onClick={verifyAadhaarOtp}>Verify OTP</Button>
//           </>
//         )}

//         <Input
//           placeholder="PAN Number"
//           value={panNumber}
//           onChange={(e) => setPanNumber(e.target.value)}
//           disabled={!kyc.aadhaarVerified || kyc.panVerified}
//         />

//         <Input
//           placeholder="Full Name (as per PAN)"
//           value={panName}
//           onChange={(e) => setPanName(e.target.value)}
//           disabled={!kyc.aadhaarVerified || kyc.panVerified}
//         />

//         <Button
//           onClick={verifyPan}
//           disabled={!kyc.aadhaarVerified || kyc.panVerified}
//         >
//           Verify PAN
//         </Button>

//         <Button
//           onClick={linkDigiLocker}
//           disabled={!kyc.panVerified || kyc.digilockerLinked}
//         >
//           Link DigiLocker
//         </Button>
//       </Card>

//       {/* DOCUMENTS */}
//       <Card className="p-6 mb-6">
//         <Progress value={(uploadedDocs.length / 4) * 100} />
//         {allowedDocs.map((d) => (
//           <Button
//             key={d}
//             className="mr-2 mt-2"
//             disabled={!kycComplete || uploadedDocs.includes(d)}
//             onClick={() => uploadDoc(d)}
//           >
//             {uploadedDocs.includes(d) ? <CheckCircle /> : <Upload />} {d}
//           </Button>
//         ))}
//       </Card>

//       <Button
//         className="w-full mb-6"
//         onClick={calculateScore}
//         disabled={loadingScore}
//       >
//         {loadingScore ? "Calculating..." : "Calculate BharatScore"}
//       </Button>

//       {creditScore && explanation && (
//         <Card className="p-6">
//           <Award className="mx-auto mb-2" />
//           <p className="text-5xl font-bold text-center">{creditScore}</p>

//           <div className="mt-4">
//             <h3 className="font-bold flex items-center gap-2">
//               <Info /> {explanation.category}
//             </h3>
//             <ul className="list-disc ml-6 mt-2">
//               {explanation.reasons.map((r, i) => (
//                 <li key={i}>{r}</li>
//               ))}
//             </ul>

//             <h4 className="font-semibold mt-3">Tips to Improve</h4>
//             <ul className="list-disc ml-6">
//               {explanation.tips.map((t, i) => (
//                 <li key={i}>{t}</li>
//               ))}
//             </ul>
//           </div>
//         </Card>
//       )}

//       <input ref={fileInputRef} type="file" hidden />
//     </div>
//   );
// };

// export default BorrowerDashboard;


import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  IdCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Award,
  LogOut,
  Info,
} from "lucide-react";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */
interface KYCStatus {
  aadhaarVerified: boolean;
  panVerified: boolean;
  digilockerLinked: boolean;
  nameMatch: boolean;
}

interface ScoreExplanation {
  category: "POOR" | "AVERAGE" | "GOOD" | "EXCELLENT";
  reasons: string[];
  tips: string[];
}

/* ---------------- CONFIG ---------------- */
const backendURL = "http://localhost:8000/api/v1";

/* ---------------- COMPONENT ---------------- */
const BorrowerDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [externalId, setExternalId] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [creditScore, setCreditScore] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<ScoreExplanation | null>(null);
  const [loadingScore, setLoadingScore] = useState(false);

  /* Aadhaar */
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarTxnId, setAadhaarTxnId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  /* PAN */
  const [panNumber, setPanNumber] = useState("");
  const [panName, setPanName] = useState("");

  const [kyc, setKyc] = useState<KYCStatus>({
    aadhaarVerified: false,
    panVerified: false,
    digilockerLinked: false,
    nameMatch: true,
  });

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  /* ---------------- BORROWER ID ---------------- */
  useEffect(() => {
    axios
      .get(`${backendURL}/borrowers/by_user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setExternalId(res.data.external_id))
      .catch(() => toast.error("Failed to load borrower ID"));
  }, [token]);

  /* ---------------- AADHAAR ---------------- */
  const initiateAadhaar = async () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      toast.error("Enter valid 12-digit Aadhaar number");
      return;
    }

    const res = await axios.post(
      `${backendURL}/kyc/aadhaar/initiate`,
      { aadhaar_number: aadhaarNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setAadhaarTxnId(res.data.transaction_id);
    setShowOtp(true);
    toast.success("OTP sent");
  };

  const verifyAadhaarOtp = async () => {
    if (!aadhaarTxnId || otp.length !== 6) return;

    await axios.post(
      `${backendURL}/kyc/aadhaar/verify`,
      { transaction_id: aadhaarTxnId, otp },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setKyc((p) => ({ ...p, aadhaarVerified: true }));
    setShowOtp(false);
    setOtp("");
    toast.success("Aadhaar verified");
  };

  /* ---------------- PAN ---------------- */
  const verifyPan = async () => {
    if (!panNumber || !panName) {
      toast.error("Enter PAN number and full name");
      return;
    }

    try {
      const res = await axios.post(
        `${backendURL}/kyc/pan/verify`,
        {
          pan_number: panNumber.toUpperCase(),
          full_name: panName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setKyc((p) => ({
        ...p,
        panVerified: true,
        nameMatch: res.data.name_match,
      }));

      toast.success("PAN verified");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "PAN verification failed");
    }
  };

  /* ---------------- DIGILOCKER ---------------- */
  const linkDigiLocker = () => {
    setKyc((p) => ({ ...p, digilockerLinked: true }));
    toast.success("DigiLocker linked");
  };

  if (!kyc.nameMatch) {
    return (
      <Card className="p-6 border-destructive mt-10">
        <AlertCircle className="text-destructive mb-2" />
        Aadhaar & PAN mismatch
      </Card>
    );
  }

  const kycComplete =
    kyc.aadhaarVerified && kyc.panVerified && kyc.digilockerLinked;

  /* ---------------- DOCUMENT UPLOAD ---------------- */
  const allowedDocs = [
    "BANK_STATEMENT",
    "SALARY_SLIP",
    "LOAN_STATEMENT",
    "UTILITY_BILL",
  ];

  const uploadDoc = (doc: string) => {
    if (!kycComplete || !externalId) return;

    fileInputRef.current!.value = "";
    fileInputRef.current!.click();

    fileInputRef.current!.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const form = new FormData();
      form.append("file", file);
      form.append("doc_type", doc.toLowerCase());

      try {
        const res = await axios.post(
          `${backendURL}/borrowers/${externalId}/upload`,
          form,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUploadedDocs((p) => [...new Set([...p, doc])]);
        toast.success(res.data.message);
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Upload failed");
      }
    };
  };

  /* ---------------- SCORE ---------------- */
  const calculateScore = async () => {
    if (!kycComplete || uploadedDocs.length < 4) {
      toast.error("Complete KYC & upload all documents");
      return;
    }

    setLoadingScore(true);
    try {
      const res = await axios.post(
        `${backendURL}/borrowers/${externalId}/calculate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreditScore(res.data.score);
      setExplanation(res.data.explanation);
    } catch (e: any) {
      toast.error(e.response?.data?.detail);
    }
    setLoadingScore(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-4xl font-bold">Borrower Dashboard</h1>
        <Button onClick={logout} variant="outline">
          <LogOut className="mr-2" size={16} /> Logout
        </Button>
      </div>

      <Card className="p-6 mb-6">
        <IdCard className="mb-2" />
        <p className="text-xl font-bold">{externalId}</p>
      </Card>

      {/* KYC */}
      <Card className="p-6 mb-6 space-y-3">
        <Input
          placeholder="Aadhaar Number"
          maxLength={12}
          value={aadhaarNumber}
          onChange={(e) =>
            setAadhaarNumber(e.target.value.replace(/\D/g, ""))
          }
          disabled={kyc.aadhaarVerified}
        />

        <Button onClick={initiateAadhaar} disabled={kyc.aadhaarVerified}>
          Verify Aadhaar
        </Button>

        {showOtp && (
          <>
            <Input
              maxLength={6}
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <Button onClick={verifyAadhaarOtp}>Verify OTP</Button>
          </>
        )}

        <Input
          placeholder="PAN Number"
          value={panNumber}
          onChange={(e) => setPanNumber(e.target.value)}
          disabled={!kyc.aadhaarVerified || kyc.panVerified}
        />

        <Input
          placeholder="Full Name (as per PAN)"
          value={panName}
          onChange={(e) => setPanName(e.target.value)}
          disabled={!kyc.aadhaarVerified || kyc.panVerified}
        />

        <Button
          onClick={verifyPan}
          disabled={!kyc.aadhaarVerified || kyc.panVerified}
        >
          Verify PAN
        </Button>

        <Button
          onClick={linkDigiLocker}
          disabled={!kyc.panVerified || kyc.digilockerLinked}
        >
          Link DigiLocker
        </Button>
      </Card>

      {/* DOCUMENTS */}
      <Card className="p-6 mb-6">
        <Progress value={(uploadedDocs.length / 4) * 100} />
        {allowedDocs.map((d) => (
          <Button
            key={d}
            className="mr-2 mt-2"
            disabled={!kycComplete || uploadedDocs.includes(d)}
            onClick={() => uploadDoc(d)}
          >
            {uploadedDocs.includes(d) ? <CheckCircle /> : <Upload />} {d}
          </Button>
        ))}
      </Card>

      <Button
        className="w-full mb-6"
        onClick={calculateScore}
        disabled={loadingScore}
      >
        {loadingScore ? "Calculating..." : "Calculate BharatScore"}
      </Button>

      {creditScore && explanation && (
        <Card className="p-6">
          <Award className="mx-auto mb-2" />
          <p className="text-5xl font-bold text-center">{creditScore}</p>

          <div className="mt-4">
            <h3 className="font-bold flex items-center gap-2">
              <Info /> {explanation.category}
            </h3>
            <ul className="list-disc ml-6 mt-2">
              {explanation.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            <h4 className="font-semibold mt-3">Tips to Improve</h4>
            <ul className="list-disc ml-6">
              {explanation.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <input ref={fileInputRef} type="file" hidden />
    </div>
  );
};

export default BorrowerDashboard;
