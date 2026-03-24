import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { generateJWT } from "../../common/utils/jwtMethods.js";
import { isValidNICFormat } from "../../common/utils/nic.util.js";

const bloodBankAdminSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "First Name Must Contain At Least 3 Characters!"],
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Name Must Contain At Least 3 Characters!"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please Provide A Valid Email"],
    },
    nic: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: isValidNICFormat,
        message: "NIC must be either 12 digits or 9 digits followed by V or X",
      },
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Password Must Contain at Least 8 Characters!"],
      select: false,
    },
    bloodBankHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    role: {
      type: String,
      default: "BloodBankAdmin",
      enum: ["BloodBankAdmin"],
      required: true,
      immutable: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; // Never return password in queries
        delete ret.__v;
        return ret;
      },
    },
  },
);

// 🔐 Hash password
bloodBankAdminSchema.pre("save", async function () {
  // We use a regular function here (not an arrow function) to have access to 'this'
  if (this.isModified("password") && this.password) {
    // Only hash the password if it is modified AND if you actually have a password in memory!
    this.password = await bcrypt.hash(this.password, 12); // Hash with cost of 12
  } // No need to call next() since we're using an async function and Mongoose will handle it
});

// ✅ Method to compare passwords during login
bloodBankAdminSchema.methods.comparePassword = async function (
  enteredPassword,
) {
  // enteredPassword = plain text password from login, this.password = hashed password in DB
  return await bcrypt.compare(enteredPassword, this.password); // Returns true if match, false if not
};

// 🔑 JWT method
bloodBankAdminSchema.methods.generateJsonWebToken = function () {
  return generateJWT({
    id: this._id,
    role: this.role,
  });
};

export const BloodBankAdmin = mongoose.model(
  "BloodBankAdmin",
  bloodBankAdminSchema,
  "blood_bank_admin",
);
