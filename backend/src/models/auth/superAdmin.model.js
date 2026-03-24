import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { generateJWT } from "../../common/utils/jwtMethods.js";
import { isValidNICFormat } from "../../common/utils/nic.util.js";

const superAdminSchema = new mongoose.Schema(
  {
    name: {
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
        minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
      },
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
    password: {
      type: String,
      required: true,
      minLength: [8, "Password Must Contain at Least 8 Characters!"],
      select: false,
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
    role: {
      type: String,
      default: "SuperAdmin",
      enum: ["SuperAdmin"],
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
      transform(doc, ret) {
        delete ret.password; // Never return password in queries
        delete ret.__v;
        return ret;
      },
    },
  },
);

// 🔐 Hash password
superAdminSchema.pre("save", async function () {
  // We use a regular function here (not an arrow function) to have access to 'this'
  if (!this.isModified("password")) return; // Only hash if password is new or modified
  this.password = await bcrypt.hash(this.password, 12); // Hash with cost of 12
  // No need to call next() since we're using an async function and Mongoose will handle it
});

// ✅ Method to compare passwords during login
superAdminSchema.methods.comparePassword = async function (enteredPassword) {
  // enteredPassword = plain text password from login, this.password = hashed password in DB
  return await bcrypt.compare(enteredPassword, this.password); // Returns true if match, false if not
};

// 🔑 JWT method
superAdminSchema.methods.generateJsonWebToken = function () {
  // We use a regular function here (not an arrow function) to have access to 'this'
  return generateJWT({
    id: this._id, // _id is automatically added by Mongoose
    role: this.role, // role is set to "SuperAdmin" by default in the schema
  });
};

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);
