import { SuperAdmin } from "../../models/auth/superAdmin.model.js";
import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";

// 🧑‍💼 Create SuperAdmin (Only 3 allowed in the system)
export const createSuperAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, nic, phone, password, confirmPassword } =
    req.body;

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }
  const count = await SuperAdmin.countDocuments(); // Check how many SuperAdmins currently exist
  if (count >= 3) {
    return next(new ErrorHandler("Max SuperAdmin limit reached", 403));
  }

  // Create the SuperAdmin (the model will automatically set role: "SuperAdmin")
  // Explicitly build the object to prevent Mass Assignment
  // Notice how we structure the nested 'name' object to match your schema
  const superAdmin = await SuperAdmin.create({
    name: {
      firstName,
      lastName,
    },
    email,
    nic,
    phone,
    password,
  });

  // 4️⃣ Send Response
  // Your toJSON transform will automatically hide the password!
  res.status(201).json({
    success: true,
    message: "New Super Admin created successfully",
    superAdmin,
  });
});
