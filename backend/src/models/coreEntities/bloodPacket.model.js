import mongoose from "mongoose";
import {
  BLOOD_GROUPS,
  formatBloodGroup,
} from "../../common/utils/bloodGroup.util.js";

const bloodPacketSchema = new mongoose.Schema(
  {
    // 1. Core Info (Keep your strict rules!)
    serialNumber: {
      type: String,
      required: [
        true,
        "A physical serial number from the blood bag must be scanned.",
      ],
      unique: true,
      uppercase: true,
      trim: true,
      // In real life, this is the barcode number printed on the bag
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      set: formatBloodGroup, // Auto-format lowercase inputs (e.g., "o+" -> "O+")
      enum: {
        values: BLOOD_GROUPS, // Strict validation against the master list
        message: "{VALUE} is not a valid blood group",
      },
    },
    volume: {
      type: Number,
      required: true,
      default: 450, // Standard blood donation is 450ml
      min: 300,
      max: 500,
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // 2. 🔗 Relationships (Connecting to your ER diagram)
    bloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BLOOD_BANK", // The hospital holding this packet right now
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor", // Traceability: Who donated this blood?
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign", // Was it collected at a campaign? (Optional)
      default: null,
    },
    // 3. Status Engine (Added your new COLLECTED status)
    status: {
      type: String,
      required: true,
      enum: [
        "COLLECTED", // Collected from the donor
        "TESTING", // Freshly donated, waiting for disease screening
        "AVAILABLE", // Safe and ready in the fridge
        "RESERVED", // Booked for a specific patient surgery
        "TRANSFUSED", // Has been given to a patient
        "EXPIRED", // Passed its shelf life
        "DISCARDED", // Failed disease testing or was damaged
      ],
      default: "TESTING",
    },
    expiryDate: {
      type: Date,
    },
    // // 4. Clinical Data (Tech Lead Tip: NEVER use raw `Object`. Always define the shape!)
    // testResults: {
    //   hiv: {
    //     type: String,
    //     enum: ["POSITIVE", "NEGATIVE", "PENDING"],
    //     default: "PENDING",
    //   },
    //   hepB: {
    //     type: String,
    //     enum: ["POSITIVE", "NEGATIVE", "PENDING"],
    //     default: "PENDING",
    //   },
    //   syphilis: {
    //     type: String,
    //     enum: ["POSITIVE", "NEGATIVE", "PENDING"],
    //     default: "PENDING",
    //   },
    //   testedBy: { type: mongoose.Schema.Types.ObjectId, ref: "SystemUser" },
    //   testedAt: { type: Date },
    // },
    // // 5. Logistics (Structured instead of raw Object)
    // storage: {
    //   refrigeratorId: { type: String },
    //   shelfNumber: { type: String },
    // },
    // reservedFor: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "PatientRequest",
    // }, // Or whatever your Request model is called

    // 6. 🏆 THE AUDIT TRAIL (Your brilliant addition)
    statusHistory: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BloodBankAdmin",
          required: true,
        },
        notes: { type: String }, // Optional: "Discarded due to fridge failure"
      },
    ],
  },
  { timestamps: true },
);

bloodPacketSchema.index({ bloodBankId: 1, status: 1, expiryDate: 1 });

// 🚀 Pre-save hook: Automatically calculate the expiry date!
bloodPacketSchema.pre("save", async function () {
  if (this.isNew && !this.expiryDate) {
    // Red blood cells typically expire in 42 days
    const expiry = new Date(this.collectionDate);
    expiry.setDate(expiry.getDate() + 42);
    this.expiryDate = expiry;
  }
});

export const BloodPacket = mongoose.model("BloodPacket", bloodPacketSchema);
