import express from "express";
import { updateRequesterProfile } from "./requester.controller.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("Requester")); // 2. Must be a Donor

// 🔄 Update My Profile
router.put("/me/update", updateRequesterProfile);

export default router;
