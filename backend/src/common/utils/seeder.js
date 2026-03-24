import mongoose from "mongoose";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

const runSeeder = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🗄️ Seeder connected to MongoDB!");

    // Later, we will write code here to automatically insert all 25 Districts or dummy Hospitals!
    console.log("🌱 Database seeded successfully!");

    process.exit();
  } catch (error) {
    console.error(`❌ Seeder Error: ${error.message}`);
    process.exit(1);
  }
};

runSeeder();
