import express from "express";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../../common/middleware/auth.middleware.js";
import { updateDonorProfile } from "./donor.controller.js";
import { bookAppointment } from "./appointment.controller.js";

const router = express.Router();

router.use(isAuthenticatedUser); // 1. Must be logged in
router.use(authorizeRoles("Donor")); // 2. Must be a Donor

// 🔄 Update My Profile
router.put("/me/update", updateDonorProfile);

// 📅 Book an Appointment
router.post("/appointments/new", bookAppointment);

export default router;
