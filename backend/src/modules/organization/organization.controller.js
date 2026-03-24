import { catchAsyncErrors } from "../../common/middleware/asyncHandler.middleware.js";
import ErrorHandler from "../../common/middleware/error.middleware.js";
import { Organization } from "../../models/auth/organization.model.js";

// 🔄 Update Organization Profile
export const updateOrganizationProfile = catchAsyncErrors(
  async (req, res, next) => {
    // 1. Get the ID from the currently logged-in Organization's token
    const orgId = req.user._id || req.user.id;

    // 2. Fetch the organization document
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return next(new ErrorHandler("Organization not found", 404));
    }

    // 3. Extract ONLY the safe fields they are allowed to change
    // We strictly ignore 'role', 'status', 'validation', etc.
    const {
      organizationName,
      presidentName,
      address,
      purpose,
      phone,
      optionalPhone,
    } = req.body;

    // 4. Carefully apply the updates
    if (organizationName) organization.organizationName = organizationName;
    if (presidentName) organization.presidentName = presidentName;
    if (purpose) organization.purpose = purpose;
    // if (email) organization.email = email.toLowerCase();

    // 📍 Address & Province Automation
    if (address) {
      if (address.street) organization.address.street = address.street;
      if (address.city) organization.address.city = address.city;
      if (address.district) {
        organization.address.district = address.district;
        // Tell Mongoose explicitly that this nested field changed!
        organization.markModified("address.district"); // Sometimes, Mongoose's watcher fails to notice that you reached inside the object.
        // 🪄 Your pre-save hook will automatically update the province here too!
      }
    }
    if (phone) organization.phone = phone;
    if (optionalPhone !== undefined) organization.optionalPhone = optionalPhone;

    // 5. Save the document to trigger all Mongoose validations and your pre-save hooks
    await organization.save({ validateModifiedOnly: true });

    // 6. Send the success response
    res.status(200).json({
      success: true,
      message: "Organization profile updated successfully!",
      data: {
        organization,
      },
    });
  },
);
