import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { BloodBankHospital } from "../../models/coreEntities/hospitals.model.js";
import { BloodBankAdmin } from "../../models/auth/bloodBankAdmin.model.js";

// 🧑‍💼 Create Blood Bank Admin Account (SuperAdmin Only)
export const createBloodBankAdmin = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    nic,
    phone,
    password,
    confirmPassword,
    bloodBankHospital,
  } = req.body;

  // 1️⃣ Validate Passwords First
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match!", 400));
  }

  // 2️⃣ Ensure the Hospital ID is provided
  if (!bloodBankHospital) {
    return next(
      new ErrorHandler(
        "Please select a Blood Bank to assign this Admin to.",
        400,
      ),
    );
  }

  // 3️⃣ Verify the Blood Bank actually exists in the database
  const bloodBankExists = await BloodBankHospital.findById(bloodBankHospital);
  if (!bloodBankExists) {
    return next(
      new ErrorHandler("The selected Blood Bank does not exist!", 404),
    );
  }

  // 4️⃣ Create the Admin Account
  // (Mongoose will automatically handle the email/NIC/phone validation rules you wrote!)
  const newAdminAccount = await BloodBankAdmin.create({
    firstName,
    lastName,
    email,
    nic,
    phone,
    password,
    bloodBankHospital,
  });

  // 5️⃣ Send Response (NO sendToken here, so the SuperAdmin stays logged in!)
  // Note: Your schema's `toJSON` transform automatically deletes the password,
  // so we don't even need to write `newAdminAccount.password = undefined` here!
  res.status(201).json({
    success: true,
    message: "Blood Bank Admin account created and linked successfully!",
    account: newAdminAccount,
  });
});
