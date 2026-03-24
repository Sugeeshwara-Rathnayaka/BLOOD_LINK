import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { Requester } from "../../models/auth/requester.model.js";

// 🔄 Update Requester Profile (For the Logged-in Requester)
export const updateRequesterProfile = catchAsyncErrors(
  async (req, res, next) => {
    // 1. Get the ID from the currently logged-in user's token
    const requesterId = req.user._id || req.user.id;

    // 2. Fetch the requester document
    const requester = await Requester.findById(requesterId);
    if (!requester) {
      return next(new ErrorHandler("Requester not found", 404));
    }

    // 3. Extract ONLY the safe fields they are allowed to change
    // We ignore things like 'role', 'nic', or 'validation' status!
    const { name, address, phone, optionalPhone, privacy } = req.body;

    // 4. Carefully apply the updates
    if (name) requester.name = name;

    if (address) {
      if (address.street) requester.address.street = address.street;
      if (address.city) requester.address.city = address.city;
      if (address.district) {
        requester.address.district = address.district;
        // Tell Mongoose explicitly that this nested field changed!
        requester.markModified("address.district"); // Sometimes, Mongoose's watcher fails to notice that you reached inside the object.
        // 🪄 Your pre-save hook will automatically update the province here too!
      }
    }

    if (phone) requester.phone = phone;
    if (optionalPhone !== undefined) requester.optionalPhone = optionalPhone;
    if (privacy !== undefined) requester.privacy = privacy; // Booleans need !== undefined check

    // 5. Save the document to trigger all Mongoose validations and hooks
    await requester.save({ validateModifiedOnly: true });

    // 6. Send the success response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      data: {
        requester, // Your schema's toJSON transform will hide the password automatically
      },
    });
  },
);
