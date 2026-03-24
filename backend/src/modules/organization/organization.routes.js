import express from "express";
import { updateOrganizationProfile } from "./organization.controller.js";
import { createCampaign } from "./campaign.controller.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("Organization")); // 2. Must be a Donor

// 🔄 Update My Profile
router.put("/me/update", updateOrganizationProfile);

// 🎪 Create a New Campaign Request
router.post("/campaigns/create", createCampaign);

export default router;
