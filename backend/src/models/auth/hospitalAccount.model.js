import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { generateJWT } from "../../common/utils/jwtMethods.js";

const hospitalAccountSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: [true, "Please choose another username"],
      lowercase: true,
      minLength: [3, "Name Must Contain At Least 3 Characters!"],
    },
    password: {
      type: String,
      required: true,
      select: false,
      minLength: [8, "Password Must Contain at Least 8 Characters!"],
    },
    role: {
      type: String,
      enum: ["Hospital"],
      default: "Hospital",
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

// 🔐 Hash password
hospitalAccountSchema.pre("save", async function () {
  // We use a regular function here (not an arrow function) to have access to 'this'
  if (!this.isModified("password")) return; // Only hash if password is new or modified
  this.password = await bcrypt.hash(this.password, 12); // Hash with cost of 12
  // No need to call next() since we're using an async function and Mongoose will handle it
});

// ✅ Method to compare passwords during login
hospitalAccountSchema.methods.comparePassword = async function (
  enteredPassword,
) {
  // enteredPassword = plain text password from login, this.password = hashed password in DB
  return await bcrypt.compare(enteredPassword, this.password); // Returns true if match, false if not
};

// 🔑 JWT method
hospitalAccountSchema.methods.generateJsonWebToken = function () {
  // We use a regular function here (not an arrow function) to have access to 'this'
  return generateJWT({
    id: this._id, // _id is automatically added by Mongoose
    role: this.role, // role is set to "Organization" by default in the schema
  });
};

export const HospitalAccount = mongoose.model(
  "HospitalAccount",
  hospitalAccountSchema,
  "hospital_account",
);
