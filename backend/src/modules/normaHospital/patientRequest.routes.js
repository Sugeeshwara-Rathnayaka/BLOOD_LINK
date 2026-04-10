import express from "express";
import {
  createPatientRequest,
  getBloodBankRequests,
  getMySentRequests,
} from "./patientRequest.controller.js";
import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();

// All routes here require the user to be logged in
router.use(isAuthenticatedUser);

// --- Hospital/Blood Bank Specific Routes ---

// 1. Submit a new request (Hospitals only)
router.post(
  "/new",
  authorizeRoles("Hospital", "BloodBankAdmin"),
  createPatientRequest,
);

// 2. Get requests sent TO my Blood Bank (Admin View)
router.get("/incoming", authorizeRoles("BloodBankAdmin"), getBloodBankRequests);

// 3. Get requests I have sent to others (Requester View)
router.get(
  "/sent",
  authorizeRoles("Hospital", "BloodBankAdmin"),
  getMySentRequests,
);

export default router;
