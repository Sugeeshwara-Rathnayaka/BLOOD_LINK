import api from "../../../services/api";

export const getDonorProfile = () => api.get("/donor/me");

export const getDonationHistory = () => api.get("/donor/history");

export const bookDonationAppointment = (data) =>
  api.post("/donor/appointments", data);
