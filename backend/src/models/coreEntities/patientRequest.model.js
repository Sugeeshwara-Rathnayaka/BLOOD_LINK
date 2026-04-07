import mongoose from "mongoose";
import {
  formatBloodGroup,
  BLOOD_GROUPS,
} from "../../common/utils/bloodGroup.util.js";

const patientRequestSchema = new mongoose.Schema(
  {
    // 1. Who is asking, and who are they asking?
    requestingHospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    targetBloodBankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    // 2. What exactly do they need?
    patientName: {
      type: String,
      required: [true, "Patient name or anonymous ID is required."],
    },
    bloodGroup: {
      type: String,
      required: true,
      set: formatBloodGroup,
      enum: BLOOD_GROUPS,
    },
    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
    },

    // 3. Clinical Context (Crucial for the Blood Bank Admin to prioritize)
    urgencyLevel: {
      type: String,
      enum: ["ROUTINE", "URGENT", "CRITICAL"],
      default: "ROUTINE",
    },
    reasonForTransfusion: {
      type: String,
      required: true, // e.g., "Car Accident", "Scheduled Surgery"
    },
    requiredByDate: {
      type: Date,
      required: true,
    },

    // 4. The Order State Machine
    status: {
      type: String,
      enum: [
        "PENDING", // Waiting for Blood Bank Admin to review
        "APPROVED", // Admin approved, but hasn't shipped yet
        "DISPATCHED", // Blood is in the ambulance/cooler
        "COMPLETED", // Hospital received the blood
        "REJECTED", // Blood Bank denied the request (e.g., out of stock)
        "CANCELLED", // Doctor cancelled the surgery
      ],
      default: "PENDING",
    },

    // 5. Inventory Linking (Which specific bags did the Admin give them?)
    assignedPackets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BloodPacket",
      },
    ],

    // 6. Audit Notes
    adminNotes: {
      type: String, // e.g., "Only had 2 units available, sending those immediately."
    },
  },
  { timestamps: true },
);

// ⚡ Add Indexes for fast dashboard filtering
patientRequestSchema.index({ targetBloodBankId: 1, status: 1 });
patientRequestSchema.index({ urgencyLevel: 1, requiredByDate: 1 });

export const PatientRequest = mongoose.model(
  "PatientRequest",
  patientRequestSchema,
);
