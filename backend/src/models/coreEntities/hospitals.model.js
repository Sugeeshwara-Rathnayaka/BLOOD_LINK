import mongoose from "mongoose";
import validator from "validator";
import {
  DISTRICT_NAMES,
  formatDistrictName,
  getProvinceByDistrict,
} from "../../common/utils/district.util.js";

// 1. The Base Schema (Shared Fields ONLY)
const hospitalSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Name Must Contain At Least 3 Characters!"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
      },
      district: {
        type: String,
        required: [true, "Please select a district"],
        set: formatDistrictName, // ✅ 1. Auto-fix spelling mistakes (e.g. "gampaha" -> "Gampaha")
        enum: {
          values: DISTRICT_NAMES, // ✅ 2. Strict validation against the master list
          message: "{VALUE} is not a valid district in Sri Lanka",
        },
      },
      province: {
        type: String,
        required: false, // We don't require the USER to send it, we fill it.
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["NORMAL", "BLOOD_BANK"],
      default: "NORMAL",
      required: true,
    },
  },
  {
    discriminatorKey: "type", // This field will determine the child model (NORMAL or BLOOD_BANK)
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: {
      transform(doc, ret) {
        delete ret.__v; // Remove the __v field from the output
        return ret; // Return the modified object
      },
    },
  },
);

// 🔗 VIRTUAL POPULATE (Updated to match your new Schema)
hospitalSchema.virtual("phoneNumbers", {
  ref: "HospitalTelephone", // The model to use
  localField: "_id", // The Hospital's "_id" field
  foreignField: "hospital", // The HospitalTelephone's "hospital" field
});

// Ensure virtuals are included in JSON
hospitalSchema.set("toJSON", { virtuals: true });
hospitalSchema.set("toObject", { virtuals: true });

// -----------------------------------------------------
// 🚀 UNIFIED PRE-SAVE HOOK (Fixes Nested Data & 'next' Error)
// -----------------------------------------------------
hospitalSchema.pre("save", async function () {
  // 2. Province Automation (Targeting nested "address.district")
  // Only run this if the 'address.district' field was actually changed (or is new)
  if (!this.isModified("address.district")) {
    return;
  }
  // Use our utility to find the province for the selected district
  const province = getProvinceByDistrict(this.address.district);
  // Save it to the document
  if (province) {
    this.address.province = province;
  }
  // No need to call next() since we're using an async function and Mongoose will handle it
});

// Export the Base Model (You can use this to search ALL hospitals)
export const Hospital = mongoose.model("Hospital", hospitalSchema, "hospitals");

// ==========================================
// 2. Child A: Normal Hospital
// ==========================================
const normalHospitalSchema = new mongoose.Schema({
  chiefDoctorName: {
    type: String,
    required: true,
    trim: true,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SuperAdmin",
    default: null,
  },
});
// Create the Discriminator
export const NormalHospital = Hospital.discriminator(
  "NORMAL", // This exactly matches your enum "NORMAL"
  normalHospitalSchema,
);

// ==========================================
// 3. Child B: Blood Bank Hospital
// ==========================================
const bloodBankHospitalSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SuperAdmin",
    required: true,
  },
});
// Create the Discriminator
export const BloodBankHospital = Hospital.discriminator(
  "BLOOD_BANK", // This exactly matches your enum "BLOOD_BANK"
  bloodBankHospitalSchema,
);
