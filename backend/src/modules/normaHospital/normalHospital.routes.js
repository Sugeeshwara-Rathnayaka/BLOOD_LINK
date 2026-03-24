import express from "express";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";
import {
  addStaffAccount,
  updateHospitalProfile,
} from "./normalHospital.controller.js";
import {
  addTelephone,
  updateTelephoneFlag,
  deleteTelephone,
} from "../telephones/telephones.controller.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("Hospital")); // 2. Must be a Hospital

router.post("/staff/new", addStaffAccount);
router.put("/me/update", updateHospitalProfile);
router.post("/telephones", addTelephone);
router.put("/telephones/:phoneId", updateTelephoneFlag);
router.delete("/telephones/:phoneId", deleteTelephone);

export default router;
