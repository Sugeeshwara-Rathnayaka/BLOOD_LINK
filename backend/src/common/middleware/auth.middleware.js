import jwt from "jsonwebtoken";
import ErrorHandler from "./error.middleware.js";
import { catchAsyncErrors } from "./asyncHandler.middleware.js";

// 1️⃣ Import ALL your user models so we can find the user
import { Donor } from "../../models/auth/donor.model.js";
import { Requester } from "../../models/auth/requester.model.js";
import { Organization } from "../../models/auth/organization.model.js";
import { HospitalAccount } from "../../models/auth/hospitalAccount.model.js"; // Remember: Hospitals login via Account!
import { BloodBankAdmin } from "../../models/auth/bloodBankAdmin.model.js";
import { SuperAdmin } from "../../models/auth/superAdmin.model.js";

// 🛡️ Middleware 1: Check if user is logged in
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // 1️⃣ Get Token from Header OR Cookie
  // We prioritize high-privilege tokens first just in case
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // "Bearer <token>" -> split by space and take the second part
    token = req.headers.authorization.split(" ")[1];
  }
  // Fallback: Check cookies if header is missing
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorHandler("Please Login to access this resource", 401));
  }

  // 2️⃣ Verify the token is real (not forged by a hacker)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3️⃣ 🪄 THE MAGIC: Find the user in the CORRECT database based on their Role!
  // We stored 'role' in the token payload during login/register, now we use it.
  let user = null;

  switch (decoded.role) {
    case "SuperAdmin":
      user = await SuperAdmin.findById(decoded.id);
      break;
    case "BloodBankAdmin":
      user = await BloodBankAdmin.findById(decoded.id);
      break;
    case "Hospital":
      // For hospitals, we find the Account, but usually want the profile details too
      user = await HospitalAccount.findById(decoded.id).populate("hospital"); // This gives us access to req.user.hospital._id AND req.user.hospital.hospitalName
      break;
    case "Donor":
      user = await Donor.findById(decoded.id);
      break;
    case "Requester":
      user = await Requester.findById(decoded.id);
      break;
    case "Organization":
      user = await Organization.findById(decoded.id);
      break;
    default:
      return next(new ErrorHandler("Unknown User Role", 403));
  }
  // 4️⃣ If token is valid but user was deleted from DB
  if (!user) {
    return next(
      new ErrorHandler("User belonging to this token no longer exists.", 401),
    );
  }
  // 5️⃣ Attach the user to the request object
  // Now every controller can just use 'req.user._id' or 'req.user.name'!
  req.user = user;
  next();
});

// 🚦 Middleware 2: Check if user has permission (Role Handling)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is in the allowed list
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role: ${req.user.role} is not allowed to access this resource`,
          403, // Forbidden
        ),
      );
    }
    next();
  };
};
