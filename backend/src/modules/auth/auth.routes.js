import express from "express";
import {
  registerDonor,
  registerRequester,
  registerOrganization,
  registerNormalHospital,
  login,
  getMyProfile,
  logout,
} from "./auth.controller.js";
import { isAuthenticatedUser } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

// 🩸 Donor Signup
router.post("/signup/donor", registerDonor);

// 🧑‍🤝‍🧑 Requester Signup
router.post("/signup/requester", registerRequester);

// 🏢 Organization Signup
router.post("/signup/organization", registerOrganization);

// 🏥 Hospital Signup (Normal / Blood Bank handled by payload)
router.post("/signup/hospital", registerNormalHospital);

// 🧑‍💼 Login
router.post("/login", login);

// 👤 Get Profile
router.get("/me", isAuthenticatedUser, getMyProfile);

// 🚪 Logout
router.get("/logout", logout); // We use GET because we are just asking the server to clear a cookie

export default router;
