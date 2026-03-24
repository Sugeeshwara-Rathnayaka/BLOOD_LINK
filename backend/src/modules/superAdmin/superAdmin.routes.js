import express from "express";
import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../../common/middleware/auth.middleware.js";
import { createSuperAdmin } from "./superAdmin.controller.js";
import { createBloodBankHospital } from "./bloodBankHospital.controller.js";
import { createBloodBankAdmin } from "./bloodBankAdmin.controller.js";
import {
  approveNormalHospital,
  getPendingHospitals,
  rejectNormalHospital,
} from "./normalHospital.controller.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("SuperAdmin")); // 2. Must be a SuperAdmin

router.post("/superadmin/create", createSuperAdmin);
router.post("/bloodbankhospital/create", createBloodBankHospital);
router.post("/bloodbankadmin/create", createBloodBankAdmin);
router.get("/normalhospital/pending", getPendingHospitals); // 🟡 Pending Route
router.put("/normalhospital/:id/approve", approveNormalHospital); // 🟢 Approve Route
router.put("/normalhospital/:id/reject", rejectNormalHospital); // 🔴 Reject Route

export default router;
