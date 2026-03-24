import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { HospitalAccount } from "../../models/auth/hospitalAccount.model.js";
import { NormalHospital } from "../../models/coreEntities/hospitals.model.js";

// 🏥 Add a Staff Account to an Existing Normal Hospital
export const addStaffAccount = catchAsyncErrors(async (req, res, next) => {
  const { userName, password, confirmPassword } = req.body;

  // 1️⃣ Validate the input
  if (!userName || !password || !confirmPassword) {
    return next(new ErrorHandler("Please provide all required fields", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match!", 400));
  }

  // 2️⃣ SECURELY get the Hospital ID from the logged-in user
  // Since we populated "hospital" in the auth middleware, we need to extract the _id
  const hospitalId = req.user.hospital._id;

  // 🛑 LIMIT CHECK: Count how many accounts this hospital already has
  const existingAccountsCount = await HospitalAccount.countDocuments({
    hospital: hospitalId,
  });

  // If they already have 2 (or somehow more), block the creation
  if (existingAccountsCount >= 2) {
    return next(
      new ErrorHandler(
        "Account limit reached. A hospital can only have a maximum of 2 accounts.",
        403,
      ),
    );
  }

  // 3️⃣ Create the new account linked to that specific hospital
  const newAccount = await HospitalAccount.create({
    hospital: hospitalId, // 👈 Safely linked!
    userName: userName,
    password: password,
  });

  // Hide the password from the response
  newAccount.password = undefined;

  // 4️⃣ Send Response
  // 🛑 We DO NOT use sendToken() here!
  // If we did, it would overwrite the Admin's login cookie with this new
  // staff member's token and kick the Admin out of their session.
  res.status(201).json({
    success: true,
    message: "New staff account created successfully!",
    account: newAccount,
  });
});

// 🔄 Update Hospital Profile (For the Logged-in Hospital)
export const updateHospitalProfile = catchAsyncErrors(
  async (req, res, next) => {
    // 1. Get the Account ID from the currently logged-in token
    const accountId = req.user._id || req.user.id;

    // 2. Fetch the Hospital Account to find the linked Hospital ID
    const account = await HospitalAccount.findById(accountId);
    if (!account || !account.hospital) {
      return next(
        new ErrorHandler("Hospital account connection not found.", 404),
      );
    }

    // 3. Fetch the actual NormalHospital document using the linked ID
    const hospital = await NormalHospital.findById(account.hospital);
    if (!hospital) {
      return next(new ErrorHandler("Hospital details not found.", 404));
    }

    // 4. Extract ONLY the safe fields they are allowed to change
    // 🚨 SECURITY: We STRICTLY ignore 'status' (PENDING/APPROVED), 'addedBy', and 'telephones' here!
    const { hospitalName, chiefDoctorName, address } = req.body;

    // 5. Carefully apply the updates
    if (hospitalName) hospital.hospitalName = hospitalName;
    if (chiefDoctorName) hospital.chiefDoctorName = chiefDoctorName;

    // 📍 Address & Province Automation (Using our trusty markModified trick!)
    if (address) {
      if (address.street) hospital.address.street = address.street;
      if (address.city) hospital.address.city = address.city;
      if (address.district) {
        hospital.address.district = address.district;
        hospital.markModified("address.district"); // Ring the Mongoose alarm bell 🔔
      }
    }

    // 6. Save the document to trigger all Mongoose validations and pre-save hooks
    await hospital.save({ validateModifiedOnly: true });

    // 7. Send the success response
    res.status(200).json({
      success: true,
      message: "Hospital profile updated successfully!",
      data: {
        hospital,
      },
    });
  },
);
