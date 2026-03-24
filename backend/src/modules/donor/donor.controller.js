import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { Donor } from "../../models/auth/donor.model.js";

// 🔄 Update Donor Profile
export const updateDonorProfile = catchAsyncErrors(async (req, res, next) => {
  const donorId = req.user._id || req.user.id;

  // 1. Fetch the donor document
  const donor = await Donor.findById(donorId);
  if (!donor) {
    return next(new ErrorHandler("Donor not found", 404));
  }

  // 2. Extract ONLY the safe fields from the request body
  const { name, address, phone, optionalPhone, privacy } = req.body;

  // 3. Carefully apply the updates
  if (name) {
    if (name.firstName) donor.name.firstName = name.firstName;
    if (name.lastName) donor.name.lastName = name.lastName;
  }

  if (address) {
    if (address.street) donor.address.street = address.street;
    if (address.city) donor.address.city = address.city;
    if (address.district) {
      donor.address.district = address.district;
      // Tell Mongoose explicitly that this nested field changed!
      donor.markModified("address.district"); // Sometimes, Mongoose's watcher fails to notice that you reached inside the object.
      // 🪄 Your pre-save hook will automatically update the province when we call .save()!
    }
  }

  if (phone) donor.phone = phone;
  if (optionalPhone !== undefined) donor.optionalPhone = optionalPhone;
  if (privacy !== undefined) donor.privacy = privacy; // Booleans need !== undefined check
  // if (bloodGroup) donor.bloodGroup = bloodGroup; // This will trigger your strict enum validation

  // 4. Save the document (Triggers validations & hooks)
  await donor.save({ validateModifiedOnly: true });

  // 5. Send the success response
  res.status(200).json({
    success: true,
    message: "Profile updated successfully!",
    data: {
      donor, // Password is automatically hidden by your toJSON transform
    },
  });
});
