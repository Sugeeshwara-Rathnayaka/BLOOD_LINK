import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { isValidNICFormat } from "../../common/utils/nic.util.js";
import { Donor } from "../../models/auth/donor.model.js";
import { BloodPacket } from "../../models/coreEntities/bloodPacket.model.js";
import { Campaign } from "../../models/coreEntities/campaign.model.js";

// ==========================================
// 🩸 REGISTER NEW BLOOD PACKET
// ==========================================
export const registerBloodPacket = catchAsyncErrors(async (req, res, next) => {
  // 1. Grab the data from the Admin's request
  const { serialNumber, bloodGroup, volume, donorNIC, campaignId } = req.body;

  // 2. 🛡️ Grab the Hospital ID securely from the logged-in Admin's token!
  const bloodBankId = req.user.bloodBankHospital || req.user._id;

  // 🛑 SECURITY: Validate the serial number
  if (!serialNumber) {
    return next(
      new ErrorHandler(
        "Please scan the blood bag's barcode to capture the serial number.",
        400,
      ),
    );
  }
  const existingPacket = await BloodPacket.findOne({ serialNumber });
  if (existingPacket) {
    return next(
      new ErrorHandler(
        "Blood packet with this serial number already exists",
        409,
      ),
    );
  }

  // 🛑 SECURITY: Validate the volume
  if (volume && (volume < 300 || volume > 500)) {
    return next(
      new ErrorHandler("Volume must be between 300ml and 500ml", 400),
    );
  }

  // 🛑 SECURITY: Validate the donor
  if (!donorNIC) {
    return next(new ErrorHandler("Please provide the Donor's NIC.", 400));
  }
  // Check if the format is legally valid using your awesome utility!
  if (!isValidNICFormat(donorNIC)) {
    return next(
      new ErrorHandler("Invalid Sri Lankan NIC format provided.", 400),
    );
  }
  const donor = await Donor.findOne({ nic: donorNIC });
  if (!donor) {
    return next(
      new ErrorHandler(`No registered donor found with NIC: ${donorNIC}`, 404),
    );
  }

  // 🛑 SECURITY: Validate the campaign
  if (campaignId) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.isDeleted) {
      return next(
        new ErrorHandler(
          "The selected campaign does not exist or has been deleted.",
          404,
        ),
      );
    }
    // SECURITY - Does this campaign actually belong to THIS hospital?
    if (campaign.bloodBankId.toString() !== bloodBankId.toString()) {
      return next(
        new ErrorHandler(
          "Security Alert: You cannot register blood for a campaign organized by a different hospital.",
          403,
        ),
      );
    }
    // STATUS - Is it legal to collect blood from this campaign?
    if (
      campaign.status === "PENDING_APPROVAL" ||
      campaign.status === "CANCELLED"
    ) {
      return next(
        new ErrorHandler(
          `Cannot register blood from a campaign that is ${campaign.status}.`,
          400,
        ),
      );
    }
  }

  // 3. Create the packet
  // 🪄 Magic happening here:
  // - bloodGroup will auto-capitalize (e.g., "o+" -> "O+")
  // - expiryDate is automatically calculated to +42 days
  // - packet status automatically defaults to "TESTING"
  const newPacket = await BloodPacket.create({
    serialNumber,
    bloodGroup,
    volume: volume || 450, // Default to 450ml if they forget to send it
    bloodBankId,
    donorId: donor._id, // 👈 Injecting the exact ID we found from the NIC!
    campaignId,
  });

  // 4. ✅ Success Response
  res.status(201).json({
    success: true,
    message: "Blood packet registered successfully. Status set to TESTING.",
    data: newPacket,
  });
});
