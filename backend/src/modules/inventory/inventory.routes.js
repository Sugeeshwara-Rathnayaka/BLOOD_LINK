import express from "express";
import {
  getBloodInventory,
  getInventorySummary,
  registerBloodPacket,
  updatePacketStatus,
} from "./inventory.controller.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();

// --------------------------------------------------
// 🛡️ ALL ROUTES BELOW REQUIRE BLOOD BANK ADMIN ACCESS
// --------------------------------------------------
router.use(isAuthenticatedUser, authorizeRoles("BloodBankAdmin", "SuperAdmin"));

// ==========================================
// 📊 DASHBOARD ROUTES
// ==========================================
// GET /api/v1/inventory/summary (Pie charts & stats)
router.get("/summary", getInventorySummary);

// ==========================================
// 🩸 BLOOD PACKET ROUTES
// ==========================================
// POST /api/v1/inventory/packets (Add blood)
router.post("/packets", registerBloodPacket);

// GET /api/v1/inventory/packets (View blood fridge)
router.get("/packets", getBloodInventory);

// PATCH /api/v1/inventory/packets/:id/status (Update lab results!)
router.patch("/packets/:id/status", updatePacketStatus);

export default router;
