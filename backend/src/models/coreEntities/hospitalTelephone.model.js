import mongoose from "mongoose";

const hospitalTelephoneSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true, // fast lookup by hospital
    },
    telephoneNo: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Allows 10-digit numbers (Sri Lanka format)
        },
        message: (props) => `${props.value} is not a valid phone number`,
      },
    },
    type: {
      type: String,
      enum: ["MOBILE", "LANDLINE", "EMERGENCY", "FAX"],
      default: "LANDLINE",
      required: true,
    },
    flag: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    addedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      role: {
        type: String,
        enum: ["SuperAdmin", "BloodBankAdmin", "Hospital"],
        required: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v; // Remove the __v field from the output
        return ret;
      },
    },
  },
);
// Prevent duplicate numbers per hospital
hospitalTelephoneSchema.index(
  { hospital: 1, telephoneNo: 1 },
  { unique: true },
);

export const HospitalTelephone = mongoose.model(
  "HospitalTelephone",
  hospitalTelephoneSchema,
  "hospital_telephone",
);
