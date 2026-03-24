import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { generateJWT } from "../../common/utils/jwtMethods.js";
import {
  isValidNICFormat,
  doesDOBMatchNIC,
  doesGenderMatchNIC,
} from "../../common/utils/nic.util.js";
import {
  DISTRICT_NAMES,
  formatDistrictName,
  getProvinceByDistrict,
} from "../../common/utils/district.util.js";

const reqSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: [3, "Name Must Contain At Least 3 Characters!"],
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate: [validator.isEmail, "Please Provide A Valid Email"],
    },
    nic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: isValidNICFormat,
        message: "NIC must be either 12 digits or 9 digits followed by V or X",
      },
    },
    dob: {
      type: Date,
      required: true,
      validate: {
        // NIC ↔ DOB match
        validator: function (value) {
          return doesDOBMatchNIC(this.nic, value);
        },
        message: "DOB does not match NIC or NIC is invalid",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
      set: (v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
      validate: {
        validator: function (value) {
          return doesGenderMatchNIC(this.nic, value);
        },
        message: "Gender does not match NIC",
      },
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
    password: {
      type: String,
      required: true,
      minLength: [8, "Password Must Contain at Least 8 Characters!"],
      select: false, // Never let the password leave the database unless I specifically ask for it.
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
    optionalPhone: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          if (!v) return true; // allow empty string
          return /^\d{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    role: {
      type: String,
      default: "Requester", // Default role for requesters
      enum: ["Requester"], // Restrict to only "requester" role
      required: true,
      immutable: true, // Prevent role changes after creation
    },
    privacy: {
      type: Boolean,
      default: false, // false = visible, true = hidden
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
); // Adds createdAt and updatedAt fields

// -----------------------------------------------------
// 🚀 UNIFIED PRE-SAVE HOOK (Fixes Nested Data & 'next' Error)
// -----------------------------------------------------
reqSchema.pre("save", async function () {
  // 1. 🔐 Hash password
  // We use a regular function here (not an arrow function) to have access to 'this'
  if (this.isModified("password") && this.password) {
    // Only hash the password if it is modified AND if you actually have a password in memory!
    this.password = await bcrypt.hash(this.password, 12); // Hash with cost of 12
  }

  // 2. 📍 Province Automation (Targeting nested "address.district")
  // Only run this if the 'address.district' field was actually changed (or is new)
  if (this.isModified("address.district")) {
    // Use our utility to find the province for the selected district
    const province = getProvinceByDistrict(this.address.district);
    // Save it to the document
    if (province) {
      this.address.province = province;
    }
    // No need to call next() since we're using an async function and Mongoose will handle it
  }
});

// ✅ Method to compare passwords during login
reqSchema.methods.comparePassword = async function (enteredPassword) {
  // enteredPassword = plain text password from login, this.password = hashed password in DB
  return await bcrypt.compare(enteredPassword, this.password); // Returns true if match, false if not
};

// 🔑 JWT method
reqSchema.methods.generateJsonWebToken = function () {
  // We use a regular function here (not an arrow function) to have access to 'this'
  return generateJWT({
    id: this._id, // _id is automatically added by Mongoose
    role: this.role, // role is set to "Requester" by default in the schema
  });
};
export const Requester = mongoose.model("Requester", reqSchema);
