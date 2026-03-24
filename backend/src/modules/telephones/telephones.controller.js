import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { BloodBankAdmin } from "../../models/auth/bloodBankAdmin.model.js";
import { HospitalAccount } from "../../models/auth/hospitalAccount.model.js";
import { HospitalTelephone } from "../../models/coreEntities/hospitalTelephone.model.js";

// ==========================================
// 1. ADD a New Telephone
// ==========================================
export const addTelephone = catchAsyncErrors(async (req, res, next) => {
  const { telephoneNo, type, flag } = req.body;
  const userRole = req.user.role; // e.g., "Hospital" or "BloodBankAdmin"
  let ownerId = null;

  // 1. 🚦 Dynamically find the owner based on their role
  if (userRole === "Hospital") {
    const account = await HospitalAccount.findById(req.user.id);
    if (!account || !account.hospital)
      return next(new ErrorHandler("Hospital profile not found", 404));
    ownerId = account.hospital; // The ID of the NormalHospital
  } else if (userRole === "BloodBankAdmin") {
    // Assuming BloodBankAdmin has a linked profile, or IS the profile!
    // (Adjust this depending on how your Blood Bank schema is structured)
    const admin = await BloodBankAdmin.findById(req.user.id);
    if (!admin)
      return next(new ErrorHandler("Blood Bank profile not found", 404));
    ownerId = admin.bloodBankHospital;
  } else {
    return next(
      new ErrorHandler("You are not authorized to add a telephone", 403),
    );
  }

  // 2. 📝 Create the new telephone document
  const newPhone = await HospitalTelephone.create({
    hospital: ownerId, // This now safely holds EITHER the Hospital ID or the Blood Bank ID!
    telephoneNo,
    type: type || "LANDLINE",
    flag: flag || "ACTIVE",
    addedBy: {
      userId: req.user.id,
      role: userRole, // Perfectly tracks whether a Hospital or BloodBank added it
    },
  });

  res.status(201).json({
    success: true,
    message: `${type || "LANDLINE"} Telephone added successfully!`,
    data: { telephone: newPhone },
  });
});

// ==========================================
// 2. UPDATE an Existing Telephone
// ==========================================
export const updateTelephoneFlag = catchAsyncErrors(async (req, res, next) => {
  const { phoneId } = req.params; // ID of the telephone from the URL
  const { flag, type } = req.body;
  const userRole = req.user.role; // e.g., "Hospital" or "BloodBankAdmin"
  let ownerId = null;

  // 1. 🚦 Dynamically find the owner based on their role
  if (userRole === "Hospital") {
    const account = await HospitalAccount.findById(req.user.id);
    if (!account || !account.hospital)
      return next(new ErrorHandler("Hospital profile not found", 404));
    ownerId = account.hospital; // The ID of the NormalHospital
  } else if (userRole === "BloodBankAdmin") {
    // Assuming BloodBankAdmin has a linked profile, or IS the profile!
    // (Adjust this depending on how your Blood Bank schema is structured)
    const admin = await BloodBankAdmin.findById(req.user.id);
    if (!admin)
      return next(new ErrorHandler("Blood Bank profile not found", 404));
    ownerId = admin.bloodBankHospital;
  } else {
    return next(
      new ErrorHandler("You are not authorized to add a telephone", 403),
    );
  }

  // 2. Find the exact phone document
  const phone = await HospitalTelephone.findById(phoneId);
  if (!phone) return next(new ErrorHandler("Telephone not found", 404));

  // 3. 🛡️ SECURITY: Does this phone belong to the logged-in hospital?
  if (phone.hospital.toString() !== ownerId.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to update this phone number",
        403,
      ),
    );
  }
  // 4. 🛑 BUSINESS LOGIC: Prevent deactivating the last active phone
  // We only care if they are changing an ACTIVE phone to something else (like INACTIVE)
  if (phone.flag === "ACTIVE" && flag !== "ACTIVE") {
    const otherActivePhonesCount = await HospitalTelephone.countDocuments({
      hospital: ownerId,
      flag: "ACTIVE",
      _id: { $ne: phoneId }, // $ne means "Not Equal" -> We exclude the current phone from the count
    });

    if (otherActivePhonesCount < 2) {
      return next(
        new ErrorHandler(
          "You must maintain at least two ACTIVE telephone number. Please add a new active phone before deactivating this one.",
          400,
        ),
      );
    }
  }
  // 5. Apply updates
  if (flag) phone.flag = flag;
  if (type) phone.type = type;
  // (Optional Architect tip: In the future, you might want a 'lastUpdatedBy' field in your schema so you don't overwrite the original 'addedBy' creator!)
  phone.addedBy = {
    userId: req.user._id || req.user.id,
    role: req.user.role,
  };

  await phone.save({ validateModifiedOnly: true });

  res.status(200).json({
    success: true,
    message: `Telephone flag updated to ${flag}`,
    data: { telephone: phone },
  });
});

// ==========================================
// 3. DELETE a Telephone
// ==========================================
export const deleteTelephone = catchAsyncErrors(async (req, res, next) => {
  const { phoneId } = req.params;
  const userRole = req.user.role; // e.g., "Hospital" or "BloodBankAdmin"
  let ownerId = null;

  // 1. 🚦 Dynamically find the owner based on their role
  if (userRole === "Hospital") {
    const account = await HospitalAccount.findById(req.user.id);
    if (!account || !account.hospital)
      return next(new ErrorHandler("Hospital profile not found", 404));
    ownerId = account.hospital; // The ID of the NormalHospital
  } else if (userRole === "BloodBankAdmin") {
    // Assuming BloodBankAdmin has a linked profile, or IS the profile!
    // (Adjust this depending on how your Blood Bank schema is structured)
    const admin = await BloodBankAdmin.findById(req.user.id);
    if (!admin)
      return next(new ErrorHandler("Blood Bank profile not found", 404));
    ownerId = admin.bloodBankHospital;
  } else {
    return next(
      new ErrorHandler("You are not authorized to add a telephone", 403),
    );
  }

  // 2. Find the phone
  const phone = await HospitalTelephone.findById(phoneId);
  if (!phone) return next(new ErrorHandler("Telephone not found", 404));

  // 3. 🛡️ SECURITY: Does this phone belong to the logged-in hospital?
  if (phone.hospital.toString() !== ownerId.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to delete this phone number",
        403,
      ),
    );
  }
  // 4. 🛑 BUSINESS LOGIC: Prevent deleting the last active phone
  if (phone.flag === "ACTIVE") {
    const otherActivePhonesCount = await HospitalTelephone.countDocuments({
      hospital: ownerId,
      flag: "ACTIVE",
      _id: { $ne: phoneId }, // Exclude the phone we are about to delete
    });

    if (otherActivePhonesCount < 2) {
      return next(
        new ErrorHandler(
          "You must maintain at least two ACTIVE telephone numbers. Please add another active phone before deleting this one.",
          400,
        ),
      );
    }
  }
  // 5. Delete it
  await phone.deleteOne();

  res.status(200).json({
    success: true,
    message: "Telephone deleted successfully!",
  });
});
