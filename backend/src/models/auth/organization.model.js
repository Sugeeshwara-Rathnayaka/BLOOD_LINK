import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import { generateJWT } from "../../common/utils/jwtMethods.js";
import {
  DISTRICT_NAMES,
  formatDistrictName,
  getProvinceByDistrict,
} from "../../common/utils/district.util.js";

const orgSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      required: true,
      minLength: [3, "Name Must Contain At Least 3 Characters!"],
    },
    userName: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      minLength: [3, "Name Must Contain At Least 3 Characters!"],
    },
    password: {
      type: String,
      required: true,
      minLength: [8, "Password Must Contain at Least 8 Characters!"],
      select: false,
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
    presidentName: {
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
    purpose: {
      type: String,
      required: false,
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
      default: "Organization",
      enum: ["Organization"],
      required: true,
      immutable: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// -----------------------------------------------------
// 🚀 UNIFIED PRE-SAVE HOOK (Fixes Nested Data & 'next' Error)
// -----------------------------------------------------
orgSchema.pre("save", async function () {
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
orgSchema.methods.comparePassword = async function (enteredPassword) {
  // enteredPassword = plain text password from login, this.password = hashed password in DB
  return await bcrypt.compare(enteredPassword, this.password); // Returns true if match, false if not
};

// 🔑 JWT method
orgSchema.methods.generateJsonWebToken = function () {
  // We use a regular function here (not an arrow function) to have access to 'this'
  return generateJWT({
    id: this._id, // _id is automatically added by Mongoose
    role: this.role, // role is set to "Organization" by default in the schema
  });
};
// Adds createdAt and updatedAt fields
export const Organization = mongoose.model("Organization", orgSchema);
