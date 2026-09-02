import { apiV1 } from "./client";

export const getLstmPaymentRisk = () =>
  apiV1.get("/ml/lstm/payment-risk");
