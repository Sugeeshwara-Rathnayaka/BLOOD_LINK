import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // 🎫 The human-readable Reservation ID (e.g., "RES-A7B9F2")
    appointmentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },
    // Is this booking at a permanent hospital or a pop-up campaign?
    locationType: {
      type: String,
      enum: ["Hospital", "Campaign"],
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: function () {
        return this.locationType === "Hospital";
      },
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: function () {
        return this.locationType === "Campaign";
      },
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String, // e.g., "09:00", "13:30"
      required: true,
      validate: {
        validator: function (value) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
        },
        message:
          "Invalid time format. Use HH:MM (24-hour), e.g., 09:00 or 14:30",
      },
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);
appointmentSchema.index({ donor: 1, status: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ donor: 1, status: 1, appointmentDate: -1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
