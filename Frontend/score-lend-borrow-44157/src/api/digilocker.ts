import { apiV1 } from "./client";

export const getDigiLockerStatus = () =>
  apiV1.get("/digilocker/status");
