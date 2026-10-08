import { PatientRequest } from "../../models/coreEntities/patientRequest.model.js";
import { BloodBankHospital } from "../../models/coreEntities/hospitals.model.js"; // Assuming you have a Hospital model
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import { BloodPacket } from "../../models/coreEntities/bloodPacket.model.js";

// ==========================================
// 🏥 1. CREATE NEW PATIENT REQUEST (B2B)
// ==========================================
export const createPatientRequest = catchAsyncErrors(async (req, res, next) => {
  const {
    targetBloodBankId,
    patientName,
    bloodGroup,
    unitsRequired,
    urgencyLevel,
    reasonForTransfusion,
    requiredByDate,
  } = req.body;

  if (!targetBloodBankId || !patientName || !bloodGroup || !unitsRequired) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  const currentHospitalId =
    req.user.role === "Hospital"
      ? req.user.hospital?.id
      : req.user.bloodBankHospital?.toString();

  if (!currentHospitalId) {
    return next(new ErrorHandler("Hospital not found", 404));
  }

  // 1. The requesting hospital is the logged-in user (from auth middleware)
  const requestingHospitalId = currentHospitalId;

  // 2. Validate that the target Blood Bank exists
  const targetBloodBank = await BloodBankHospital.findById(targetBloodBankId);
  if (!targetBloodBank) {
    return next(new ErrorHandler("Target Blood Bank not found", 404));
  }

  // 3. Prevent a hospital from requesting from itself (Safety Check)
  if (requestingHospitalId === targetBloodBankId) {
    return next(
      new ErrorHandler(
        "You cannot request blood from your own inventory.",
        400,
      ),
    );
  }

  // 4. Create the Request
  const request = await PatientRequest.create({
    requestingHospitalId,
    targetBloodBankId,
    patientName,
    bloodGroup,
    unitsRequired,
    urgencyLevel,
    reasonForTransfusion,
    requiredByDate,
    status: "PENDING", // Initial state
  });

  res.status(201).json({
    success: true,
    message: "Blood request submitted successfully to the Blood Bank.",
    request,
  });
});

// ==========================================
// 📊 2. GET ALL REQUESTS (For Blood Bank Dashboard)
// ==========================================
export const getBloodBankRequests = catchAsyncErrors(async (req, res, next) => {
  // 1. Identify the Blood Bank using the ID stored in the user profile
  const bloodBankId = req.user.bloodBankHospital;
  if (!bloodBankId) {
    return next(
      new ErrorHandler("This account is not linked to a Blood Bank.", 403),
    );
  }
  // Only show requests where THIS hospital is the 'targetBloodBank'
  const requests = await PatientRequest.find({
    targetBloodBankId: bloodBankId,
  })
    .populate({
      path: "requestingHospitalId",
      select: "hospitalName email address",
      populate: {
        path: "phoneNumbers", // populate the virtual 'phoneNumbers' inside the hospital
        select: "telephoneNo type flag",
        match: { flag: "ACTIVE" }, // 1.It MUST be an active number
        perDocumentLimit: 1, // 2. Only take the first 1 it finds per hospital!
      },
    })
    .sort({ createdAt: -1 }); // Newest first

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

// ==========================================
// 📤 3. GET MY SENT REQUESTS (For Hospital Dashboard)
// ==========================================
export const getMySentRequests = catchAsyncErrors(async (req, res, next) => {
  // 1. Extract the Hospital ID safely
  // If role is 'Hospital', it's in req.user.hospital._id (because it's populated)
  // If role is 'BloodBankAdmin', it's likely req.user.hospital (the raw ID)
  const currentHospitalId =
    req.user.role === "Hospital"
      ? req.user.hospital?._id
      : req.user.bloodBankHospital;

  if (!currentHospitalId) {
    return next(
      new ErrorHandler("No hospital associated with this account", 400),
    );
  }
  // 2. Find requests where THIS hospital is the target
  const requests = await PatientRequest.find({
    requestingHospitalId: currentHospitalId,
  })
    .populate({
      path: "targetBloodBankId",
      select: "hospitalName email address",
      populate: {
        path: "phoneNumbers", // populate the virtual 'phoneNumbers' inside the hospital
        select: "telephoneNo type flag",
        match: { flag: "ACTIVE" }, // 1.It MUST be an active number
        perDocumentLimit: 1, // 2. Only take the first 1 it finds per hospital!
      },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

// ==========================================
// ✅ 4. UPDATE REQUEST STATUS & ASSIGN BLOOD
// ==========================================
export const updateRequestStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // The request ID from the URL
  const { status, assignedPackets } = req.body; // "APPROVED" or "REJECTED", and an array of Packet IDs

  // 1. Find the pending request
  const request = await PatientRequest.findById(id);
  if (!request) {
    return next(new ErrorHandler("Blood request not found", 404));
  }

  // 2. Security Check: Ensure the logged-in user actually owns the target Blood Bank
  const currentHospitalId =
    req.user.role === "Hospital"
      ? req.user.hospital?.id
      : req.user.bloodBankHospital?.toString();

  if (request.targetBloodBankId.toString() !== currentHospitalId) {
    return next(
      new ErrorHandler(
        "You do not have permission to modify this request",
        403,
      ),
    );
  }

  // 3. Prevent updating already processed requests
  if (request.status !== "PENDING") {
    return next(
      new ErrorHandler(`This request is already ${request.status}`, 400),
    );
  }

  // 4. Handle REJECTION Flow
  if (status === "REJECTED") {
    request.status = "REJECTED";
    await request.save();
    return res.status(200).json({
      success: true,
      message: "Blood request rejected successfully.",
      request,
    });
  }

  // 5. Handle APPROVAL & FULFILLMENT Flow
  if (status === "APPROVED") {
    if (!assignedPackets || assignedPackets.length === 0) {
      return next(
        new ErrorHandler(
          "You must assign specific Blood Packets to approve this order.",
          400,
        ),
      );
    }

    // Verify all assigned packets are actually in the fridge and AVAILABLE
    const availablePackets = await BloodPacket.find({
      _id: { $in: assignedPackets },
      status: "AVAILABLE", // Ensure they haven't been dispatched to someone else!
    });

    if (availablePackets.length !== assignedPackets.length) {
      return next(
        new ErrorHandler(
          "One or more selected blood packets are invalid or already dispatched. Please refresh your inventory.",
          400,
        ),
      );
    }

    // Update the physical Blood Packets to show they are booked for this request
    await BloodPacket.updateMany(
      { _id: { $in: assignedPackets } },
      { $set: { status: "RESERVED" } },
    );

    // Update the Request
    request.status = "APPROVED";
    request.assignedPackets = assignedPackets; // Save the barcodes/IDs to the receipt
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request approved and blood packets have been dispatched.",
      request,
    });
  }

  return next(new ErrorHandler("Invalid status update provided", 400));
});
