import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { NormalHospital } from "../../models/coreEntities/hospitals.model.js";

// 📋 Get All Pending Hospitals with Telephones (SuperAdmin Only) - AGGREGATION VERSION
export const getPendingHospitals = catchAsyncErrors(async (req, res) => {
  const pendingHospitals = await NormalHospital.aggregate([
    // 🏭 STAGE 1: $match (The "Filter")
    // This replaces .find({ status: "PENDING" })
    {
      $match: { status: "PENDING" },
    },

    // 🏭 STAGE 2: $sort (The "Organizer")
    // This replaces .sort({ createdAt: -1 })
    {
      $sort: { createdAt: -1 },
    },

    // 🏭 STAGE 3: $lookup (The "JOIN")
    // This replaces all that manual array extracting and JavaScript filtering!
    {
      $lookup: {
        from: "hospital_telephone", // ⚠️ Double check this is the exact collection name in MongoDB!
        localField: "_id", // The _id from the NormalHospital
        foreignField: "hospital", // The field inside the hospital_telephone collection
        as: "telephones", // It will automatically create an array called 'telephones' and put the matches inside!
      },
    },

    // 🏭 STAGE 4: $project (The "Cleanup")
    // This replaces .select() to hide fields we don't want to send to the frontend
    {
      $project: {
        __v: 0, // Hide the hospital's version key
        "telephones.__v": 0, // Hide the version key inside the nested telephones array
        "telephones.addedBy": 0, // Hide audit info if the frontend doesn't need it
        // Add any other fields you want to hide using a 0
      },
    },
  ]);

  // If there are no pending hospitals, 'pendingHospitals' will just be an empty array [],
  // so we don't even need the "if (length === 0)" check anymore!

  // 🚀 Send the response
  res.status(200).json({
    success: true,
    count: pendingHospitals.length,
    message: "Pending hospitals retrieved successfully",
    data: {
      hospitals: pendingHospitals,
    },
  });
});

// ✅ Approve Normal Hospital (SuperAdmin Only)
export const approveNormalHospital = catchAsyncErrors(
  async (req, res, next) => {
    const hospitalId = req.params.id; // We will pass the ID in the URL
    // 1. Find the hospital
    const hospital = await NormalHospital.findById(hospitalId);
    if (!hospital) {
      return next(new ErrorHandler("Hospital not found.", 404));
    }
    // 2. Check if it is already approved
    if (hospital.status === "APPROVED") {
      return next(new ErrorHandler("This hospital is already approved.", 400));
    }
    // 3. Update the fields
    hospital.status = "APPROVED";
    hospital.reviewedBy = req.user._id; // 👈 Records which Super Admin approved it
    // 4. Save the changes to the database
    await hospital.save();
    res.status(200).json({
      success: true,
      message: `${hospital.hospitalName} has been approved successfully!`,
      data: {
        hospital,
      },
    });
  },
);

// ❌ Optional: Reject Normal Hospital (SuperAdmin Only)

export const rejectNormalHospital = catchAsyncErrors(async (req, res, next) => {
  const hospitalId = req.params.id;

  const hospital = await NormalHospital.findById(hospitalId);

  if (!hospital) {
    return next(new ErrorHandler("Hospital not found.", 404));
  }

  hospital.status = "REJECTED";
  // You might want to clear the approvedBy field if it was previously approved
  hospital.reviewedBy = null;

  await hospital.save();

  res.status(200).json({
    success: true,
    message: `${hospital.hospitalName} has been rejected.`,
    data: {
      hospital,
    },
  });
});
