import ErrorHandler from "./error.middleware.js";
import mongoose from "mongoose";

export const errorMiddleware = (err, req, res, next) => {
  // Default values if none are provided
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // 🔴 1. Log the error for debugging (in development mode)
  if (process.env.NODE_ENV === "development") {
    console.error("🔥 ERROR LOG:", err);
  }

  // 🔴 2. Handle Mongoose CastError (Invalid ObjectId)
  // Example: Trying to find a hospital by ID, but the ID is too short or has invalid characters
  if (err instanceof mongoose.Error.CastError) {
    err = new ErrorHandler(
      `Resource not found. Invalid ${err.path}: ${err.value}`,
      400,
    );
  }

  // 🔴 3. Handle Mongoose Duplicate Key Error
  // Example: Trying to signup with an email that is already in the database
  if (err.code === 11000) {
    err = new ErrorHandler(
      `Duplicate ${Object.keys(err.keyValue)} entered`,
      409,
    );
  }

  // 🔴 4. Handle mongoose validation errors
  // (We check err.name as a fallback just in case the instanceof check fails in some Mongoose versions)
  if (
    err instanceof mongoose.Error.ValidationError ||
    err.name === "ValidationError"
  ) {
    const messages = Object.values(err.errors).map((val) => val.message);
    err = new ErrorHandler(`Validation failed: ${messages.join(", ")}`, 400);
  }

  // 🔴 5. Handle Wrong JWT Error
  // Example: A user sends a tampered or fake token
  if (err.name === "JsonWebTokenError") {
    err = new ErrorHandler(`JSON Web Token is invalid, try again`, 401);
  }

  // 🔴 6. Handle JWT Expired Error
  // Example: A user's login session has expired
  if (err.name === "TokenExpiredError") {
    err = new ErrorHandler(`JSON Web Token is expired, try again`, 401);
  }

  // // 🔴 7. Handle Custom Mongoose Unique Errors (Sets 500 to 400)
  if (err.name === "MongooseError") {
    err = new ErrorHandler(err.message, 400);
  }

  // ✅ Finally, send the formatted error to the frontend
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // Optional: Show stack trace only in dev mode
  });
};

/*
 * =========================================================================
 * HTTP STATUS CODE CHEAT SHEET
 * =========================================================================
 * * 200 (OK): Standard response for successful requests.
 * * 201 (Created): Resource created successfully.
 * * 400 (Bad Request): Missing fields, wrong ID formats, validation fails.
 * * 401 (Unauthorized): Invalid token, expired token, wrong password.
 * * 403 (Forbidden): Token is valid, but the user doesn't have the right Role (RBAC).
 * * 404 (Not Found): Route doesn't exist, or database lookup returned nothing.
 * * 409 (Conflict): Email or ID already exists in the database.
 * * 500 (Internal Server Error): Something went wrong on the server side (e.g., crash, bug).
 * =========================================================================
 */
