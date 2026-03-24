import mongoose from "mongoose";
import {
  DISTRICT_NAMES,
  formatDistrictName,
  getProvinceByDistrict,
} from "../../common/utils/district.util.js";

const campaignSchema = new mongoose.Schema(
  {
    campaignId: {
      type: String, // Example: "CAMP-9A2B4C"
      required: true,
      unique: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    // 🏥 Requires the Org to select which Blood Bank they want to partner with!
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BLOOD_BANK",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
    },
    location: {
      venue: {
        type: String,
        required: [true, "Campaign location is required"],
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
        required: true,
      },
    },
    date: {
      type: Date,
      required: [true, "Campaign date is required"],
    },
    // ✅ Split into Start and End for our Appointment Booking logic, keeping the Regex!
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid start time format (HH:MM)`,
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid end time format (HH:MM)`,
      },
    },
    estimateAmount: {
      type: Number, // Estimated number of blood pints/donors
      required: [true, "Estimated target amount is required"],
      min: [10, "A campaign must aim for at least 10 donations"],
    },
    status: {
      type: String,
      enum: ["PENDING_APPROVAL", "UPCOMING", "COMPLETED", "CANCELLED"],
      default: "PENDING_APPROVAL",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// 🚀 Performance Indexes
campaignSchema.index({ bloodBankId: 1, status: 1 });
campaignSchema.index({ status: 1, date: 1 });
campaignSchema.index({ "location.district": 1, date: 1 });
campaignSchema.index({ organizationId: 1, status: 1 });
campaignSchema.index({ isDeleted: 1, date: 1 });

// 📍 Province Automation (Targeting nested "location.district")
campaignSchema.pre("validate", async function () {
  // Only run this if the 'location.district' field was actually changed (or is new)
  if (this.location?.district) {
    // Use our utility to find the province for the selected district
    const province = getProvinceByDistrict(this.location.district);
    // Save it to the document
    if (province) {
      this.location.province = province;
    }
    // No need to call next() since we're using an async function and Mongoose will handle it
  }
});

export const Campaign = mongoose.model("Campaign", campaignSchema);
