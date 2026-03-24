import express from "express";
import { registerBloodPacket } from "./inventory.controller.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("BloodBankAdmin", "SuperAdmin")); // 2. Must be a BloodBankAdmin or SuperAdmin

// POST /api/v1/inventory/packets
router.post("/packets", registerBloodPacket);

export default router;
