import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { BloodBankHospital } from "../../models/coreEntities/hospitals.model.js";
import { HospitalTelephone } from "../../models/coreEntities/hospitalTelephone.model.js";
import mongoose from "mongoose";

// 🩸 Create Blood Bank Hospital (SuperAdmin creates directly with APPROVED status)
export const createBloodBankHospital = catchAsyncErrors(
  async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { hospital } = req.body;

      if (!hospital) {
        return next(new ErrorHandler("Hospital data required", 400));
      }

      // 1️⃣ Separate Telephones from Hospital Data
      // We remove 'telephones' so it doesn't cause errors in the Hospital model
      const { telephones, ...hospitalData } = hospital;

      // 🔍 DEBUGGING: Check if user exists
      // console.log("Current User:", req.user);

      // 🛡️ Get Admin ID Safely (Handle _id or id)
      const adminId = req.user._id || req.user.id;

      if (!adminId) {
        return next(
          new ErrorHandler(
            "Authentication Error: User ID is missing. Are you logged in?",
            401,
          ),
        );
      }

      // 🔒 Secure fields (APPLY TO hospitalData 👈)
      hospitalData.status = "APPROVED"; // Directly set to APPROVED since SuperAdmin is creating it
      hospitalData.isActive = true; // Directly set to false since Blood Bank Admin added telephoneNo and will activate it
      hospitalData.createdBy = adminId; // Set creator as the logged-in SpuerAdmin

      // 2️⃣ Create the Blood Bank Hospital using the discriminator model
      const newBloodBank = await BloodBankHospital.create([hospitalData], {
        session,
      });
      const hospitalId = newBloodBank[0]._id;

      // 3️⃣ Create Telephones (If provided)
      let savedTelephones = [];
      if (telephones && telephones.length > 0) {
        const phoneRecords = telephones.map((phone) => ({
          hospital: hospitalId,
          telephoneNo: phone.telephoneNo,
          type: phone.type || "LANDLINE",
          flag: "ACTIVE",
          addedBy: {
            userId: adminId, // 👈 Audit: Added by Super Admin
            role: "SuperAdmin",
          },
        }));

        savedTelephones = await HospitalTelephone.insertMany(phoneRecords, {
          session,
        });
      }
      // 4️⃣ Commit Transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: "Blood Bank Hospital created successfully!",
        data: {
          hospital: newBloodBank[0],
          telephones: savedTelephones,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return next(error);
    }
  },
);
