import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import crypto from "crypto"; // 👈 Built into Node.js, no npm install needed!
import { Hospital } from "../../models/coreEntities/hospitals.model.js";
import { Appointment } from "../../models/coreEntities/appointment.model.js";
import { Campaign } from "../../models/coreEntities/campaign.model.js";

// ==========================================
// 📅 BOOK AN APPOINTMENT (For Donors)
// ==========================================
export const bookAppointment = catchAsyncErrors(async (req, res, next) => {
  const donorId = req.user._id || req.user.id;
  let { locationType, locationId, appointmentDate, timeSlot } = req.body;

  // 🛑 BASIC VALIDATION
  if (!locationType || !locationId || !timeSlot) {
    return next(new ErrorHandler("Please provide location and time slot", 400));
  }
  if (!["Hospital", "Campaign"].includes(locationType)) {
    return next(
      new ErrorHandler(
        "Invalid location type. Must be Hospital or Campaign.",
        400,
      ),
    );
  }

  // 1. 🛑 DYNAMIC TIME CHECK
  const requestedHour = parseInt(timeSlot.split(":")[0], 10); // e.g., "09:00" -> 9
  let bookingDate; // We will establish this dynamically

  // ==========================================
  // 🏥 SCENARIO A: HOSPITAL BOOKING
  // ==========================================
  if (locationType === "Hospital") {
    if (!appointmentDate) {
      return next(
        new ErrorHandler(
          "Please select a date for your hospital appointment",
          400,
        ),
      );
    }
    bookingDate = new Date(appointmentDate);
    bookingDate.setHours(0, 0, 0, 0);

    const hospital = await Hospital.findById(locationId);
    if (!hospital) return next(new ErrorHandler("Hospital not found", 404));

    // Check Hospital Hours (09:00 to 16:00)
    if (requestedHour < 9 || requestedHour >= 16) {
      return next(
        new ErrorHandler(
          "Hospital donations are only accepted between 09:00 and 16:00",
          400,
        ),
      );
    }
  }

  // ==========================================
  // 🎪 SCENARIO B: CAMPAIGN BOOKING
  // ==========================================
  else if (locationType === "Campaign") {
    // 🎪 Dynamic Campaign Hours
    // First, we must fetch the actual campaign from the database
    const campaign = await Campaign.findById(locationId);
    if (!campaign) {
      return next(new ErrorHandler("Campaign not found!", 404));
    }
    // Check Campaign Status
    if (campaign.status !== "UPCOMING") {
      return next(
        new ErrorHandler("This campaign is not available for booking.", 400),
      );
    }

    // 1. 🪄 AUTO-ASSIGN THE DATE! (The donor doesn't even need to send it)
    bookingDate = new Date(campaign.date);
    bookingDate.setHours(0, 0, 0, 0);

    // 2. Check specific Campaign Hours
    // (Assuming your Campaign schema has `startTime` and `endTime` fields like "08:00" and "13:00")
    const campaignStartHour = parseInt(campaign.startTime.split(":")[0], 10);
    const campaignEndHour = parseInt(campaign.endTime.split(":")[0], 10);

    if (requestedHour < campaignStartHour || requestedHour >= campaignEndHour) {
      return next(
        new ErrorHandler(
          `This campaign only operates between ${campaign.startTime} and ${campaign.endTime}`,
          400,
        ),
      );
    }
  } else {
    return next(new ErrorHandler("Invalid location type", 400));
  }

  // ==========================================
  // 🛡️ UNIVERSAL SAFETY CHECKS (Applies to both)
  // ==========================================

  // 1. 🛑 TIME TRAVEL CHECK (Don't allow past dates)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for a fair comparison
  if (bookingDate < today) {
    return next(
      new ErrorHandler("You cannot book an appointment in the past!", 400),
    );
  }

  // 2. 🚫 PENDING APPOINTMENT CHECK
  const pendingAppointment = await Appointment.findOne({
    donor: donorId,
    status: "PENDING",
  });

  if (pendingAppointment) {
    const type = pendingAppointment.locationType;
    return next(
      new ErrorHandler(
        `You already have a pending ${type} appointment. Please complete or cancel it first.`,
        409,
      ),
    );
  }

  // ==========================================
  // 🩺 DONOR ELIGIBILITY CHECK (History)
  // ==========================================

  // 1. Find the donor's most recent COMPLETED appointment
  const lastDonation = await Appointment.findOne({
    donor: donorId,
    status: "COMPLETED",
  }).sort({ appointmentDate: -1 }); // -1 sorts by newest date first

  // 2. If they have donated before, calculate the days between then and the new booking
  if (lastDonation) {
    // Convert both dates to milliseconds, subtract them, and convert back to days
    const timeDifference =
      bookingDate.getTime() - lastDonation.appointmentDate.getTime(); // in milliseconds
    const daysSinceLastDonation = Math.floor(
      timeDifference / (1000 * 3600 * 24),
    ); // in days

    // Sri Lanka standard is usually 4 months (roughly 120 days)
    const REQUIRED_WAITING_DAYS = 120;

    if (daysSinceLastDonation < REQUIRED_WAITING_DAYS) {
      // Calculate exactly when they are allowed to donate again
      const nextEligibleDate = new Date(lastDonation.appointmentDate);
      nextEligibleDate.setDate(
        nextEligibleDate.getDate() + REQUIRED_WAITING_DAYS,
      );
      return next(
        new ErrorHandler(
          `For your safety, you must wait ${REQUIRED_WAITING_DAYS} days between donations. You will be eligible to donate again on ${nextEligibleDate.toDateString()}.`,
          403,
        ),
      );
    }
  }

  // ==========================================
  // 💾 SAVE TO DATABASE
  // ==========================================

  // 🎫 GENERATE THE RESERVATION ID
  // crypto creates 3 random bytes, converts them to hex, and uppercases them
  const shortCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const appointmentNumber = `APP-${shortCode}`; // Example: "APP-4F8A2C"

  // 5. 📝 PREPARE THE DATA
  const appointmentData = {
    appointmentNumber,
    donor: donorId,
    locationType,
    appointmentDate: bookingDate,
    timeSlot,
    ...(locationType === "Hospital"
      ? { hospital: locationId }
      : { campaign: locationId }),
  };

  // 6. 💾 SAVE THE APPOINTMENT
  const newAppointment = await Appointment.create(appointmentData);

  res.status(201).json({
    success: true,
    message: `Successfully booked! Your Reservation ID is ${appointmentNumber}`,
    data: {
      appointment: newAppointment,
    },
  });
});
