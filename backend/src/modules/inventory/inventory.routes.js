import express from "express";
import {
  registerBloodPacket,
  updatePacketStatus,
} from "./inventory.controller.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("BloodBankAdmin", "SuperAdmin")); // 2. Must be a BloodBankAdmin or SuperAdmin

// POST /api/v1/inventory/packets
router.post("/packets", registerBloodPacket);

// GET /api/v1/inventory/packets (View blood fridge)
// router.get("/packets", getBloodInventory);

// PATCH /api/v1/inventory/packets/:id/status (Update lab results!)
router.patch("/packets/:id/status", updatePacketStatus);

export default router;
