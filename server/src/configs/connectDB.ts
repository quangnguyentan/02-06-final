// import mongoose from "mongoose";
// export async function connectDB() {
//   try {
//     const connectedBD = await mongoose.connect(
//       process.env.MONGO_URI as string,
//       {
//         dbName: "hoiquantv",
//         serverSelectionTimeoutMS: 5000, // Tự ngắt nếu không kết nối trong 5s
//       }
//     );
//     if (!connectedBD) {
//       console.log("Couldn't connect to MongoDB");
//       process.exit(1);
//     } else {
//       console.log(`✅ Connected to MongoDB: ${connectedBD.connection.name}`);
//     }
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
//   mongoose.connection.on("error", (err) => {
//     console.error("MongoDB connection error (event):", err);
//   });
// }

import mongoose from "mongoose";
import logger from "../utils/logger";

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    logger.info("MongoDB is already connected");
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "hoiquantv",
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 100, // Tăng số kết nối tối đa
      retryWrites: true,
      retryReads: true,
    });

    isConnected = true;
    logger.info(`✅ Connected to MongoDB: ${conn.connection.name}`);

    // Xử lý reconnect khi mất kết nối
    mongoose.connection.on("disconnected", () => {
      isConnected = false;
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
      setTimeout(connectDB, 5000); // Thử reconnect sau 5s
    });

    mongoose.connection.on("error", (err) => {
      isConnected = false;
      logger.error("MongoDB connection error:", err);
    });

    return conn;
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    throw error; // Thay vì exit, để caller xử lý
  }
}

// Export để tái sử dụng kết nối
export const db = mongoose.connection;
