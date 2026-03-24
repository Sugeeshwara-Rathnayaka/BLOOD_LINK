import { Campaign } from "../../models/coreEntities/campaign.model.js";
import { Hospital } from "../../models/coreEntities/hospitals.model.js"; // Adjust path/name if needed!
import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import crypto from "crypto";

// ==========================================
// 🎪 CREATE A NEW CAMPAIGN (For Organizations)
// ==========================================
export const createCampaign = catchAsyncErrors(async (req, res, next) => {
  const organizationId = req.user._id || req.user.id;
  const {
    name,
    date,
    venue,
    district,
    startTime,
    endTime,
    estimateAmount,
    bloodBankId,
  } = req.body;

  // 🛑 BASIC VALIDATION
  if (
    !name ||
    !date ||
    !venue ||
    !district ||
    !startTime ||
    !endTime ||
    !estimateAmount ||
    !bloodBankId
  ) {
    return next(
      new ErrorHandler("Please provide all required campaign details.", 400),
    );
  }

  // 🏥 VERIFY THE BLOOD BANK EXISTS
  const hospitalExists = await Hospital.findById(bloodBankId);
  if (!hospitalExists) {
    return next(
      new ErrorHandler("The selected Blood Bank Hospital does not exist.", 404),
    );
  }

  // 🛑 PLANNING CHECK (Must be 7 days in advance)
  const campaignDate = new Date(date);
  campaignDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minPlanningDate = new Date(today);
  minPlanningDate.setDate(minPlanningDate.getDate() + 7);

  if (campaignDate < minPlanningDate) {
    return next(
      new ErrorHandler(
        "Campaigns must be scheduled at least 7 days in advance.",
        400,
      ),
    );
  }

  // 🏥 HOSPITAL CAPACITY CHECK (Overbooking prevention)
  // 1. Create a "Start of Day" and "End of Day" to search the entire 24-hour period
  const startOfDay = new Date(campaignDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(campaignDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 2. Count how many campaigns this hospital already has on this day
  const existingCampaignsCount = await Campaign.countDocuments({
    bloodBankId: bloodBankId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
    // Only count active campaigns! Ignore "CANCELLED" or "COMPLETED" ones.
    status: { $in: ["PENDING_APPROVAL", "UPCOMING"] },
    isDeleted: false,
  });

  // 3. Set your hospital limit (Let's assume a hospital can only handle 1 campaign per day)
  const MAX_CAMPAIGNS_PER_DAY = 2;

  if (existingCampaignsCount >= MAX_CAMPAIGNS_PER_DAY) {
    return next(
      new ErrorHandler(
        `The selected Blood Bank is already at maximum capacity (${MAX_CAMPAIGNS_PER_DAY} campaign) for this date. Please select a different date or another hospital.`,
        409, // 409 Conflict
      ),
    );
  }

  // ⏰ STRICT TIME VALIDATION
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  // A. Ensure campaigns only happen between 8 AM and 6 PM (18:00)
  if (startH < 8 || endH > 18 || (endH === 18 && endM > 0)) {
    return next(
      new ErrorHandler(
        "Campaigns must be scheduled between 08:00 and 18:00.",
        400,
      ),
    );
  }

  // B. Ensure end time is strictly after start time
  const startTotalMinutes = startH * 60 + startM;
  const endTotalMinutes = endH * 60 + endM;

  if (endTotalMinutes <= startTotalMinutes) {
    return next(
      new ErrorHandler("End time must be strictly after the start time.", 400),
    );
  }

  // 🎫 GENERATE THE CAMPAIGN ID (e.g., "CAMP-7A2F9B")
  const shortCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const campaignId = `CAMP-${shortCode}`;

  // 💾 PREPARE DATA (Formatting the district, finding the province, and checking times are all handled by Mongoose now!)
  const campaignData = {
    campaignId,
    organizationId,
    bloodBankId,
    name,
    location: {
      venue,
      district,
    },
    date: campaignDate,
    startTime,
    endTime,
    estimateAmount,
  };

  // 🚀 SAVE TO DATABASE
  // This triggers your pre("save") hooks (Time validation, Province calculation, etc.)
  const newCampaign = await Campaign.create(campaignData);

  res.status(201).json({
    success: true,
    message: `Campaign request sent to ${hospitalExists.hospitalName}! Your Campaign ID is ${campaignId}.`,
    data: {
      campaign: newCampaign,
    },
  });
});
