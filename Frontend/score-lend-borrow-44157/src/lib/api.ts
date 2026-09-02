// src/lib/api.ts
const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "http://localhost:8000";

function ok(res: Response) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/** POST /api/v1/docs/classify (multipart) */
export async function classifyDoc(file: File, expected: "AADHAAR" | "PAN" | "SALARY_SLIP" | "BANK_STATEMENT") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("expected_type", expected);
  const res = await fetch(`${BASE}/api/v1/docs/classify`, { method: "POST", body: fd });
  return ok(res) as Promise<{ detected_type: string; is_valid: boolean; reason: string }>;
}

/** POST /api/v1/docs/extract (multipart) */
export async function extractDoc(borrowerId: string, docType: string, file: File) {
  const fd = new FormData();
  fd.append("borrower_id", borrowerId);
  fd.append("doc_type", docType);
  fd.append("file", file);
  const res = await fetch(`${BASE}/api/v1/docs/extract`, { method: "POST", body: fd });
  return ok(res) as Promise<{ fields: Record<string, any>; quality: string }>;
}

/** POST /api/v1/borrowers/:id/documents (json) */
export async function saveBorrowerDocument(borrowerId: string, payload: any) {
  const res = await fetch(`${BASE}/api/v1/borrowers/${borrowerId}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return ok(res);
}

/** POST /api/v1/borrowers/:id/score (json body = profile) */
/** POST /api/v1/scoring/borrowers/:external_id/score */
export async function scoreBorrower(externalId: string) {
  const res = await fetch(`${BASE}/api/v1/scoring/borrowers/${externalId}/score`, {
    method: "POST",
  });
  return ok(res) as Promise<{
    score: number;
    risk_probability: number;
    last_scored_at: string;
    blocked?: boolean;
  }>;
}


/** GET /api/v1/borrowers/:id */
export async function getBorrower(borrowerId: string) {
  const res = await fetch(`${BASE}/api/v1/borrowers/${borrowerId}`);
  return ok(res) as Promise<{
    borrower_id: string;
    email?: string;
    full_name?: string;
    documents: Array<{ doc_type: string; is_valid: boolean; detected_type?: string; extracted_json: any; uploaded_at: string }>;
    score?: { value: number; risk_probability: number; last_scored_at: string };
  }>;
}
