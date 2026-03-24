import mongoose from "mongoose"; // Import the Mongoose library

const connectDB = async () => {
  try {
    // Just pass the URI string. No extra options needed for modern Mongoose!
    const conn = await mongoose.connect(process.env.MONGO_URII);

    // Bonus: It's often helpful to log the host you connected to
    console.log(`✅ Connected to MongoDB: ${conn.connection.host} `); // Log a success message with the host name
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message); // Log an error message if the connection fails
    process.exit(1); // Exit the process with a failure code
  }
};

export default connectDB;
