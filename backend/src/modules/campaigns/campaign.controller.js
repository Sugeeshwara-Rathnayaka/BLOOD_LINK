import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import { Campaign } from "../../models/coreEntities/campaign.model.js";

// ==========================================
// 📅 GET ALL UPCOMING CAMPAIGNS (For Donors)
// ==========================================
export const getAllCampaigns = catchAsyncErrors(async (req, res, next) => {
  // 1. 🕒 Filter logic: Only get campaigns that are 'UPCOMING'
  // and haven't happened yet (date is greater than or equal to today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const campaigns = await Campaign.find({
    status: "UPCOMING",
    date: { $gte: today },
  })
    .populate({
      path: "bloodBankId",
      select: "hospitalName address",
      populate: {
        path: "phoneNumbers",
        select: "telephoneNo type flag",
        match: { flag: "ACTIVE" }, // 1.It MUST be an active number
        perDocumentLimit: 1, // 2. Only take the first 1 it finds per hospital!
      },
    }) // 🏥 Join with Hospital data
    .populate("organizationId", "organizationName email phone optionalPhone") // 🏥 Join with Organization data
    .sort({ date: 1 }); // 🗓️ Sort by date: soonest first

  // 2. 📊 Handle empty results
  if (!campaigns || campaigns.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No upcoming campaigns found at the moment.",
      data: [],
    });
  }

  // 3. ✅ Success Response
  res.status(200).json({
    success: true,
    count: campaigns.length,
    data: campaigns,
  });
});
