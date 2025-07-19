import mongoose from "mongoose";
export async function connectDB() {
  try {
    const connectedBD = await mongoose.connect(
      process.env.MONGO_URI as string,
      {
        dbName: "hoiquantv",
        serverSelectionTimeoutMS: 5000, // Tự ngắt nếu không kết nối trong 5s
      }
    );
    if (!connectedBD) {
      console.log("Couldn't connect to MongoDB");
      process.exit(1);
    } else {
      console.log(`✅ Connected to MongoDB: ${connectedBD.connection.name}`);
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error (event):", err);
  });
}
