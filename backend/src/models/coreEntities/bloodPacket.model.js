import mongoose from "mongoose";
import {
  BLOOD_GROUPS,
  formatBloodGroup,
} from "../../common/utils/bloodGroup.util.js";

const bloodPacketSchema = new mongoose.Schema(
  {
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
    },
    status: {
      type: String,
      required: true,
      enum: [
        "TESTING", // Freshly donated, waiting for disease screening
        "AVAILABLE", // Safe and ready in the fridge
        "RESERVED", // Booked for a specific patient surgery
        "TRANSFUSED", // Has been given to a patient
        "EXPIRED", // Passed its shelf life
        "DISCARDED", // Failed disease testing or was damaged
      ],
      default: "TESTING",
    },
    collectionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    // 🔗 Relationships (Connecting to your ER diagram)
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
  },
  { timestamps: true },
);

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
