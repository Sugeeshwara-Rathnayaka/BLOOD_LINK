import express from "express";
import {
  addTelephone,
  updateTelephoneFlag,
  deleteTelephone,
} from "../telephones/telephones.controller.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";
import { updateBloodBankAdminPhone } from "./bloodBankAdmin.controller.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("BloodBankAdmin")); // 2. Must be a BloodBankAdmin

router.put("/phone/update", updateBloodBankAdminPhone);
router.post("/telephones", addTelephone);
router.put("/telephones/:phoneId", updateTelephoneFlag);
router.delete("/telephones/:phoneId", deleteTelephone);

export default router;
