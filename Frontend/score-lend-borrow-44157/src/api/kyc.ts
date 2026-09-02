import { apiV1 } from "./client";

export const initiateAadhaar = () =>
  apiV1.post("/kyc/aadhaar/initiate");

export const verifyAadhaar = (transaction_id: string, otp: string) =>
  apiV1.post("/kyc/aadhaar/verify", { transaction_id, otp });

export const verifyPAN = (pan_number: string, full_name: string) =>
  apiV1.post("/kyc/pan/verify", { pan_number, full_name });
