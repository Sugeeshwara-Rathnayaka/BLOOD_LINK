import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { BloodBankAdmin } from "../../models/auth/bloodBankAdmin.model.js";

// 🔄 Update Blood Bank Admin Profile
export const updateBloodBankAdminPhone = catchAsyncErrors(
  async (req, res, next) => {
    // 1. Get the ID from the currently logged-in Admin's token
    const adminId = req.user._id || req.user.id;

    // 2. Fetch the admin document
    const admin = await BloodBankAdmin.findById(adminId);
    if (!admin) {
      return next(new ErrorHandler("Blood Bank Admin profile not found", 404));
    }

    // 3. Extract ONLY the safe fields they are allowed to change
    // 🛑 SECURITY: We strictly ignore 'nic', 'role', 'isActive', and 'bloodBankHospital'
    const { phone } = req.body;

    // 4. Carefully apply the updates
    if (phone) admin.phone = phone;

    // 5. Save the document to trigger all Mongoose validations
    await admin.save({ validateModifiedOnly: true });

    // 6. Send the success response
    res.status(200).json({
      success: true,
      message: "Admin profile updated successfully!",
      data: {
        admin,
      },
    });
  },
);
