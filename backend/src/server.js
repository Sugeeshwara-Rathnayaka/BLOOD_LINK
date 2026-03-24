import express from "express"; // Import the Express library
import dotenv from "dotenv"; // Import the dotenv library to load environment variables
import cookieParser from "cookie-parser"; // Import cookie-parser to parse cookies in incoming requests
import connectDB from "./config/db.js"; // Import the function to connect to the database

import authRoutes from "./modules/auth/auth.routes.js"; // Import the authentication routes
import SuperAdminRoutes from "./modules/superAdmin/superAdmin.routes.js"; // Import the SuperAdmin routes
import BloodBankAdminRoutes from "./modules/bloodBankAdmin/bloodBankAdmin.routes.js"; // Import the BloodBankAdmin routes
import HospitalRoutes from "./modules/normaHospital/normalHospital.routes.js"; // Import the Hospital routes
import DonorRoutes from "./modules/donor/donor.routes.js"; // Import the Donor routes
import RequesterRoutes from "./modules/requester/requester.routes.js"; // Import the Requester routes
import OrganizationRoutes from "./modules/organization/organization.routes.js"; // Import the Organization routes

import { errorMiddleware } from "./common/middleware/globalError.middleware.js"; // Import the custom error handling middleware

dotenv.config(); // Load environment variables from .env file
connectDB(); // Connect to the database before starting the server
const app = express(); // Create an instance of the Express application
app.use(cookieParser()); // Middleware to parse cookies in incoming requests

app.use(express.json()); // Middleware to parse JSON bodies

app.get("/", (req, res) => res.send("Server is Live!")); // Define a route for the root URL

app.use("/api/v1/auth", authRoutes); // Use the authentication routes for any requests to /api/v1/auth
app.use("/api/v1/superadmin", SuperAdminRoutes); // Use the SuperAdmin routes for any requests to /api/v1/superadmin
app.use("/api/v1/bloodbankadmin", BloodBankAdminRoutes); // Use the BloodBankAdmin routes for any requests to /api/v1/bloodbankadmin
app.use("/api/v1/hospital", HospitalRoutes); // Use the Hospital routes for any requests to /api/v1/hospital
app.use("/api/v1/donor", DonorRoutes); // Use the Donor routes for any requests to /api/v1/donor
app.use("/api/v1/requester", RequesterRoutes); // Use the Requester routes for any requests to /api/v1/requester
app.use("/api/v1/organization", OrganizationRoutes); // Use the Organization routes for any requests to /api/v1/organization

// 🛑 If this is placed ABOVE the routes, it will never trigger and you will get HTML! 🛑
app.use(errorMiddleware); // Middleware to handle errors globally

const PORT = process.env.PORT || 5000; // Define the port to listen on
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)); // Log a message when the server starts
