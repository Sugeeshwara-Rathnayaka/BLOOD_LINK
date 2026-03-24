import mongoose from "mongoose";
import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
// Import ONLY the models allowed for public signup
import { Donor } from "../../models/auth/donor.model.js";
import { Requester } from "../../models/auth/requester.model.js";
import { Organization } from "../../models/auth/organization.model.js";
import { HospitalAccount } from "../../models/auth/hospitalAccount.model.js";
// Hospital base model (discriminator parent)
import { NormalHospital } from "../../models/coreEntities/hospitals.model.js";
import { HospitalTelephone } from "../../models/coreEntities/hospitalTelephone.model.js";
import { sendToken } from "../../common/utils/jwt.util.js";
import { SuperAdmin } from "../../models/auth/superAdmin.model.js";
import { BloodBankAdmin } from "../../models/auth/bloodBankAdmin.model.js";

// ============================================================================
// 1. PUBLIC SIGNUP (Donor, Requester, Organization, Normal Hospital Accounts)
// ============================================================================

// 🩸 1. Register Donor
export const registerDonor = catchAsyncErrors(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  // 1️⃣ Check if both fields exist and if they match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match!", 400));
  }
  // 2️⃣ If they match, proceed with creating the user
  const user = await Donor.create(req.body); // Model automatically sets role: "Donor"

  // Use the universal sendToken function to handle cookie and response
  sendToken(user, 201, res, "Donor registered!"); // The sendToken function will generate the JWT, set the cookie, and send the response
});

// 🧑‍🤝‍🧑 2. Register Requester
export const registerRequester = catchAsyncErrors(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  // 1️⃣ Check if both fields exist and if they match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match!", 400));
  }
  // 2️⃣ If they match, proceed with creating the user
  const user = await Requester.create(req.body); // Model automatically sets role: "Requester"

  // Use the universal sendToken function to handle cookie and response
  sendToken(user, 201, res, "Requester registered!"); // The sendToken function will generate the JWT, set the cookie, and send the response
});

// 🏢 3. Register Organization
export const registerOrganization = catchAsyncErrors(async (req, res, next) => {
  const { password, confirmPassword } = req.body;
  // 1️⃣ Check if both fields exist and if they match
  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match!", 400));
  }
  // 2️⃣ If they match, proceed with creating the user
  const user = await Organization.create(req.body); // Model automatically sets role: "Organization"

  // Use the universal sendToken function to handle cookie and response
  sendToken(user, 201, res, "Organization registered!"); // The sendToken function will generate the JWT, set the cookie, and send the response
});

// 🏥 4. Register Normal Hospital (Requires special handling)
export const registerNormalHospital = catchAsyncErrors(
  async (req, res, next) => {
    const session = await mongoose.startSession(); // Start a new session for transaction
    session.startTransaction(); // Start the transaction

    try {
      const {
        hospital, // Contains: { hospitalName, address, telephones: [...], ... }
        account, // Contains: { userName, password, confirmPassword }
      } = req.body;

      if (!hospital || !account) {
        return next(
          new ErrorHandler("Hospital data and account data are required", 400),
        );
      }

      // 🛑 Check for mismatch (accessing properties inside the 'account' object)
      if (account.password !== account.confirmPassword) {
        return next(new ErrorHandler("Password do not match!", 400));
      }

      // ✂️ Separate 'telephones' from the rest of the hospital data
      // We don't want to send 'telephones' array to the Hospital model,
      // because the Hospital model doesn't have that field (it uses a Virtual).
      const { telephones, ...hospitalData } = hospital; // This removes the 'telephones' array from the object we send to "NormalHospital.create".

      // 🔒 Secure fields
      hospital.status = "PENDING";
      hospital.isActive = true;
      delete hospital.createdBy; // Prevent client from setting createdBy
      delete hospital.reviewedBy; // Prevent client from setting reviewedBy

      // 1️⃣ Create Hospital Profile using the Discriminator Model (this will automatically set type: "NORMAL")
      const newHospital = await NormalHospital.create([hospitalData], {
        session,
      });
      const hospitalId = newHospital[0]._id; // Get the ID immediately

      // 2️⃣ Create Hospital Account linked to Hospital Profile (using the HospitalAccount model)
      const hospitalAccount = await HospitalAccount.create(
        [
          {
            hospital: hospitalId, // Link to the newly created hospital profile
            userName: account.userName,
            password: account.password,
          },
        ],
        { session },
      );
      // 3️⃣ Create Telephone Records (Inside Transaction!)
      let savedTelephones = []; // 👈 Initialize empty array
      if (telephones && telephones.length > 0) {
        const phoneRecords = telephones.map((phone) => ({
          hospital: hospitalId, // 🔗 Link to the new hospital
          telephoneNo: phone.telephoneNo,
          type: phone.type || "LANDLINE",
          flag: "ACTIVE", // Default flag
          addedBy: {
            userId: hospitalId, // The hospital "owns" this number
            role: "Hospital", // Role is Hospital
          },
        }));
        // ⚠️ Pass { session } to ensure it rolls back if error occurs
        savedTelephones = await HospitalTelephone.insertMany(phoneRecords, {
          session,
        });
      }

      // 4️⃣ Commit transaction
      await session.commitTransaction(); // If we reach this point, both creations were successful, so we can commit
      session.endSession(); // End the session

      // 5️⃣ Send secure token cookie along with the hospital profile
      sendToken(
        hospitalAccount[0], // We pass the hospital account to generate the token, which will include the hospital's ID in the payload
        201,
        res,
        "Hospital registered successfully! Awaiting approval.",
        { hospital: newHospital[0], telephones: savedTelephones }, // 👈 Passes the extra data!
      );
    } catch (error) {
      await session.abortTransaction(); // 🛑 If any error occurs, we abort the transaction to rollback any changes
      session.endSession(); // End the session
      return next(error); // Pass the error to the global error handler
    }
  },
);

// ==========================================================================
// 2. UNIVERSAL LOGIN (Finds user across ANY collection)
// ==========================================================================

// 🔐 Universal Login (For ALL Users)
export const login = catchAsyncErrors(async (req, res, next) => {
  // Use "identifier" because Hospitals use 'userName' but others use 'email' or 'nic'
  const { identifier, password, role } = req.body;

  // 1️⃣ Validate Input
  if (!identifier || !password || !role) {
    return next(
      new ErrorHandler("Please provide identifier, password, and role", 400),
    );
  }

  let user = null; // This will hold the found user, if any
  let extraData = {}; // This will hold any extra data we want to send back on login (like hospital profile)

  // 2️⃣ Find the user in the correct collection based on their role
  // We MUST use .select("+password") because we hid it in the schemas!
  switch (role) {
    case "SuperAdmin":
      user = await SuperAdmin.findOne({ nic: identifier }).select("+password");
      break;
    case "BloodBankAdmin":
      user = await BloodBankAdmin.findOne({ nic: identifier }).select(
        "+password",
      );
      break;
    case "Hospital":
      // Hospitals log in with userName, and we populate the hospital data!
      user = await HospitalAccount.findOne({ userName: identifier })
        .select("+password")
        .populate("hospital");
      break;
    case "Donor":
      user = await Donor.findOne({ nic: identifier }).select("+password");
      break;
    case "Requester":
      user = await Requester.findOne({ nic: identifier }).select("+password");
      break;
    case "Organization":
      user = await Organization.findOne({ userName: identifier }).select(
        "+password",
      );
      break;
    default:
      return next(new ErrorHandler("Invalid user role specified", 400));
  }

  // 3️⃣ Check if user exists
  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // 4️⃣ Verify Password (Using your custom schema method!)
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }

  // 5️⃣ Security & Business Logic Checks
  // if (user.isActive === false) {
  //   return next(
  //     new ErrorHandler(
  //       "Your account has been deactivated. Please contact an admin.",
  //       403,
  //     ),
  //   );
  // }

  // If it's a Hospital, block them if the SuperAdmin hasn't approved them yet!
  if (role === "Hospital" && user.hospital) {
    if (user.hospital.status === "PENDING") {
      return next(
        new ErrorHandler(
          "Your hospital account is still pending approval.",
          403,
        ),
      );
    }
    if (
      user.hospital.status === "REJECTED" ||
      user.hospital.status === "SUSPENDED"
    ) {
      return next(
        new ErrorHandler(
          `Your hospital account is ${user.hospital.status}.`,
          403,
        ),
      );
    }
    // We package the hospital profile so the frontend gets it on login!
    extraData = { hospitalProfile: user.hospital };
  }

  // 6️⃣ Send Secure Token
  sendToken(user, 200, res, `${user.role} Login successful!`, extraData);
});

// ==========================================================================
// 3. UNIVERSAL GET PROFILE (Finds user across ANY collection)
// ==========================================================================

// 🌍 Universal Get Profile (Works for ALL Roles)
export const getMyProfile = catchAsyncErrors(async (req, res, next) => {
  // 1. Get the ID and Role from the currently logged-in user (from your auth middleware)
  const userId = req.user._id || req.user.id;
  const userRole = req.user.role;

  let userProfile = null;

  // 2. Dynamically fetch fresh data based on their role
  switch (userRole) {
    case "Donor":
      userProfile = await Donor.findById(userId);
      break;
    case "Requester":
      userProfile = await Requester.findById(userId);
      break;
    case "Organization":
      userProfile = await Organization.findById(userId);
      break;
    case "Hospital":
      // For hospitals, we also populate the hospital details so they have everything
      userProfile = await HospitalAccount.findById(userId).populate({
        path: "hospital",
        populate: { path: "phoneNumbers", select: "telephoneNo type flag" },
      });
      break;
    case "BloodBankAdmin":
      userProfile = await BloodBankAdmin.findById(userId).populate({
        path: "bloodBankHospital",
        populate: { path: "phoneNumbers", select: "telephoneNo type flag" },
      });
      break;
    case "SuperAdmin":
      userProfile = await SuperAdmin.findById(userId);
      break;
    default:
      return next(new ErrorHandler("Invalid user role detected.", 400));
  }

  // 3. Security check: Does the user still exist in the database?
  if (!userProfile) {
    return next(
      new ErrorHandler("User profile not found. Please log in again.", 404),
    );
  }

  // 4. Send the universal response
  res.status(200).json({
    success: true,
    message: `${userRole} profile retrieved successfully`,
    data: {
      role: userRole, // 👈 Super helpful for the frontend to know which dashboard to show!
      user: userProfile, // The toJSON transform in your schemas will automatically hide passwords
    },
  });
});

// ==========================================================================
// 4. UNIVERSAL LOGOUT (Clears the cookie for ANY user)
// ==========================================================================

export const logout = catchAsyncErrors(async (req, res) => {
  // We clear the cookie by overriding it with an empty string
  // and setting its expiration time to right now.
  res
    .status(200)
    .cookie("token", "", {
      expires: new Date(Date.now()), // Expires immediately
      httpOnly: true,

      // 🔴 MUST MATCH YOUR sendToken.js EXACTLY 🔴
      secure: process.env.NODE_ENV === "production", // Ensures it works on HTTPS in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Prevents CSRF
    })
    .json({
      success: true,
      message: "Logged out successfully!",
    });
});
