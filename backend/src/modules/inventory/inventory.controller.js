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

// ==========================================
// 🔄 UPDATE BLOOD PACKET STATUS
// ==========================================
export const updatePacketStatus = catchAsyncErrors(async (req, res, next) => {
  // 1. Grab the Packet ID from the URL (e.g., /packets/64b9f8e7.../status)
  const { id } = req.params;

  // 2. Grab the new status from the Request Body
  const { status } = req.body;

  // 3. Identify the logged-in hospital
  const bloodBankId = req.user.bloodBankHospital || req.user._id;

  // 🛑 SECURITY: Validate the input
  if (!status) {
    return next(new ErrorHandler("Please provide the new status.", 400));
  }

  // Ensure they are sending a valid status based on your Mongoose Enum
  const validStatuses = [
    "TESTING",
    "AVAILABLE",
    "RESERVED",
    "TRANSFUSED",
    "EXPIRED",
    "DISCARDED",
  ];
  if (!validStatuses.includes(status.toUpperCase())) {
    return next(
      new ErrorHandler(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        400,
      ),
    );
  }

  // 4. Find the exact blood packet
  const packet = await BloodPacket.findById(id);

  if (!packet) {
    return next(new ErrorHandler("Blood packet not found.", 404));
  }

  // 🛑 SECURITY: Ownership Check!
  // Can Hospital A change Hospital B's blood status? NO!
  if (packet.bloodBankId.toString() !== bloodBankId.toString()) {
    return next(
      new ErrorHandler(
        "Security Alert: You cannot update a blood packet that belongs to another hospital.",
        403,
      ),
    );
  }

  const currentStatus = packet.status;
  const nextStatus = status.toUpperCase();

  // 🛑 Check 1: Is it the exact same status?
  if (currentStatus === nextStatus) {
    return next(
      new ErrorHandler(`Packet is already marked as ${currentStatus}.`, 400),
    );
  }

  // 🛑 Check 2: The Expiry Interceptor!
  // If the bag has physically expired, but the DB doesn't know it yet,
  // catch it here, force it to EXPIRED, and reject the Admin's request.
  if (
    packet.expiryDate < new Date() &&
    currentStatus !== "EXPIRED" &&
    currentStatus !== "DISCARDED"
  ) {
    // Log the automated transition before saving!
    packet.statusHistory.push({
      from: currentStatus,
      to: "EXPIRED",
      changedBy: req.user._id, // Log the ID of the Admin who triggered the check
      notes:
        "SYSTEM AUTO-UPDATE: Packet past expiration date. Locked automatically during status update attempt.",
    });

    packet.status = "EXPIRED";
    await packet.save();
    return next(
      new ErrorHandler(
        "URGENT: This blood packet has passed its expiration date. The system has automatically locked it as EXPIRED.",
        400,
      ),
    );
  }

  // 🛑 Check 3: Your beautiful State Machine (Allowed Transitions)
  const allowedTransitions = {
    TESTING: ["AVAILABLE", "DISCARDED"],
    AVAILABLE: ["RESERVED", "EXPIRED", "DISCARDED"], // Added DISCARDED (what if a fridge breaks?)
    RESERVED: ["TRANSFUSED", "AVAILABLE"], // Can go back to AVAILABLE if surgery is cancelled!
    TRANSFUSED: [], // Terminal state
    EXPIRED: ["DISCARDED"], // Terminal state (but can be thrown in the trash)
    DISCARDED: [], // Terminal state
  };

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    return next(
      new ErrorHandler(
        `Invalid medical workflow: Cannot change status from ${currentStatus} to ${nextStatus}`,
        400,
      ),
    );
  }
  // Push to the Audit Trail
  packet.statusHistory.push({
    from: currentStatus,
    to: nextStatus,
    changedBy: req.user._id, // Who clicked the button!
    notes: req.body.notes || "", // Optional notes from the frontend
  });

  // 5. 💾 Update and Save
  packet.status = status.toUpperCase();
  await packet.save();

  // 6. ✅ Success Response
  res.status(200).json({
    success: true,
    message: `Blood packet status successfully updated to ${packet.status}.`,
    data: packet,
  });
});
