// import express from "express";
// import cors, { CorsOptions } from "cors";
// import dotenv from "dotenv";
// import { initRoutes } from "./src/routes/index.routes";
// import path from "path";
// import { connectDB } from "./src/configs/connectDB";
// import cookieParser from "cookie-parser";
// import { startPolling } from "./seed";
// import { WebSocketServer } from "ws";
// import http from "http";
// process.env.TZ = "Asia/Ho_Chi_Minh";
// dotenv.config();
// const app = express();
// const PORT = process.env.PORT ?? 5000;
// const allowedOrigins = [
//   "https://hoiquan.live",
//   "http://localhost:5173",
//   "http://192.168.1.5:5173",
// ];

// const corsOptions: CorsOptions = {
//   origin: (
//     origin: string | undefined,
//     callback: (err: Error | null, allow?: boolean | string) => void
//   ) => {
//     if (!origin) {
//       // Cho phép yêu cầu không có origin (ví dụ: từ server-side hoặc non-browser client)
//       callback(null, true);
//     } else if (allowedOrigins.includes(origin)) {
//       console.log("Allowed origin set to:", origin);
//       callback(null, origin);
//     } else {
//       console.log("Blocked origin:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// // app.use((req, res, next) => {
// //   res.removeHeader("Access-Control-Allow-Origin");
// //   res.removeHeader("Access-Control-Allow-Credentials");
// //   const origin = req.headers.origin;
// //   if (origin && allowedOrigins.includes(origin)) {
// //     res.setHeader("Access-Control-Allow-Origin", origin);
// //     res.setHeader("Access-Control-Allow-Credentials", "true");
// //   }
// //   res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
// //   res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
// //   if (req.method === "OPTIONS") {
// //     res.setHeader(
// //       "Access-Control-Allow-Methods",
// //       "GET, POST, PUT, DELETE, OPTIONS"
// //     );
// //     res.setHeader(
// //       "Access-Control-Allow-Headers",
// //       "Content-Type, Authorization"
// //     );
// //     res.status(204).end(); // Proper preflight response
// //     return;
// //   }
// //   next();
// // });

// app.use(
//   (
//     err: Error,
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     const origin = req.headers.origin;
//     if (origin && allowedOrigins.includes(origin)) {
//       res.header("Access-Control-Allow-Origin", origin);
//       res.header("Access-Control-Allow-Credentials", "true");
//     }
//     res
//       .status(err.name === "NotAllowedError" ? 403 : 500)
//       .json({ error: err.message });
//   }
// );

// app.use(cookieParser());
// // app.use(
// //   "/static",
// //   (req, res, next) => {
// //     const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
// //     const ext = path.extname(req.path).toLowerCase();
// //     if (imageExtensions.includes(ext)) {
// //       res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
// //     }
// //     next();
// //   },
// //   express.static(path.join(__dirname, "./assets/images"))
// // );
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// initRoutes(app);
// connectDB();

// // Cache ETag
// const etags: { [key: string]: string } = {};

// const setETag = (
//   req: express.Request,
//   res: express.Response,
//   next: express.NextFunction
// ) => {
//   const endpoint = req.path;
//   const data = res.locals.data || {}; // Giả sử data được lưu trong res.locals
//   const etag = require("crypto")
//     .createHash("md5")
//     .update(JSON.stringify(data))
//     .digest("hex");
//   etags[endpoint] = etag;
//   res.set("ETag", etag);
//   next();
// };

// app.use((req, res, next) => {
//   const endpoint = req.path;
//   const clientEtag = req.headers["if-none-match"];
//   if (clientEtag && etags[endpoint] === clientEtag) {
//     res.status(304).end();
//     return;
//   }
//   next();
// });

// // Tạo server HTTP để hỗ trợ cả Express và WebSocket
// const server = http.createServer(app);
// const wss = new WebSocketServer({ server });

// // Lưu trữ thời gian cập nhật cuối cùng
// let lastUpdate: { [key: string]: Date } = {
//   matches: new Date(0),
//   replays: new Date(0),
//   sports: new Date(0),
// };

// const broadcastUpdate = (endpoint: string) => {
//   wss.clients.forEach((client) => {
//     if (client.readyState === 1) {
//       client.send(
//         JSON.stringify({
//           type: "data_updated",
//           endpoint: endpoint,
//           timestamp: new Date().toISOString(),
//         })
//       );
//     }
//   });
// };

// // Kiểm tra thay đổi từ DB (cần triển khai)
// const checkUpdates = () => {
//   const now = new Date();
//   if (now.getTime() - lastUpdate.matches.getTime() > 10000) {
//     broadcastUpdate("/api/matches");
//     lastUpdate.matches = now;
//   }
//   if (now.getTime() - lastUpdate.replays.getTime() > 10000) {
//     broadcastUpdate("/api/replays");
//     lastUpdate.replays = now;
//   }
//   if (now.getTime() - lastUpdate.sports.getTime() > 300000) {
//     broadcastUpdate("/api/sports");
//     lastUpdate.sports = now;
//   }
// };

// setInterval(checkUpdates, 5000); // Kiểm tra mỗi 5 giây

// // Xử lý WebSocket connections
// wss.on("connection", (ws) => {
//   console.log(
//     "Client connected to WebSocket at",
//     new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
//   );

//   ws.on("message", (message) => {
//     console.log(`Received from client: ${message}`);
//     ws.send(JSON.stringify({ type: "ack", message: "Message received" }));
//   });

//   const interval = setInterval(() => {
//     ws.send(
//       JSON.stringify({
//         type: "data_updated",
//         endpoint: "/api/replays",
//         timestamp: new Date().toISOString(),
//       })
//     );
//   }, 10000); // Cập nhật mỗi 10 giây

//   ws.on("close", () => {
//     console.log(
//       "Client disconnected at",
//       new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
//     );
//     clearInterval(interval);
//   });

//   ws.onerror = (error) => {
//     console.error(
//       "WebSocket error at",
//       new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }),
//       (error as any).message
//     );
//   };
// });

// // Khởi động server
// server.listen(PORT, () => {
//   console.log(
//     `Server is running on http://localhost:${PORT} and ws://localhost:${PORT}/ws at`,
//     new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
//   );
//   startPolling();
// });

import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import { initRoutes } from "./src/routes/index.routes";
import path from "path";
import { connectDB } from "./src/configs/connectDB";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import http from "http";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import cluster from "cluster";
import os from "os";
import { createClient } from "redis";
import mongoose from "mongoose";
import { startPolling } from "./seed";
import logger from "./src/utils/logger";

process.env.TZ = "Asia/Ho_Chi_Minh";
dotenv.config();

const numCPUs = os.cpus().length;
const app = express();
const PORT = process.env.PORT ?? 8080;
const allowedOrigins = [
  "https://hoiquan.live",
  "http://localhost:5173",
  "http://192.168.1.5:5173",
  "http://51.79.181.110:5173",
];

// Redis client with improved retry logic
const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries: number) => {
      const maxRetries = 5;
      if (retries >= maxRetries) {
        logger.error("Max Redis retries reached");
        return new Error("Max retries reached");
      }
      const delay = Math.min(retries * 1000, 5000);
      logger.warn(
        `Retrying Redis connection (${
          retries + 1
        }/${maxRetries}) after ${delay}ms`
      );
      return delay;
    },
  },
});

redis.on("error", (err) => logger.error("Redis error:", err));
redis.connect().catch((err) => logger.error("Redis connection failed:", err));

// Rate limiting for all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: "rate-limit:",
  }),
  keyGenerator: (req) => req.ip || "unknown-ip",
  handler: (req, res) => {
    logger.warn(`Rate limit reached for IP: ${req.ip}, URL: ${req.url}`);
    res.status(429).json({
      error: "Too Many Requests",
      retryAfter: 60,
      timestamp: new Date().toISOString(),
    });
  },
});

// Rate limiting for critical endpoints
const criticalEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: "critical-rate-limit:",
  }),
  keyGenerator: (req) => req.ip || "unknown-ip",
});

// CORS configuration
const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean | string) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin ?? true);
    } else {
      logger.warn(`Blocked CORS origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `IP: ${req.ip} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

app.use(cors(corsOptions));
app.use(limiter);
app.use("/api/matches", criticalEndpointLimiter);
app.use("/api/replays", criticalEndpointLimiter);
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, "public"), {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (path.endsWith("favicon.ico")) {
        res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache favicon for 1 year
      }
    },
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ETag middleware
const etags: { [key: string]: { etag: string; data: any } } = {};
app.use((req, res, next) => {
  const endpoint = req.path;
  const clientEtag = req.headers["if-none-match"];
  const cached = etags[endpoint];
  if (clientEtag && cached && cached.etag === clientEtag) {
    res.status(304).end();
    return;
  }
  res.locals.setETag = (data: any) => {
    const etag = require("crypto")
      .createHash("md5")
      .update(JSON.stringify(data))
      .digest("hex");
    etags[endpoint] = { etag, data };
    res.set("ETag", etag);
  };
  next();
});

// Initialize routes
initRoutes(app);

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    logger.error("Request error:", err);
    res.status(err.name === "NotAllowedError" ? 403 : 500).json({
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
);

// Create HTTP and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({
  server,
  verifyClient: (info, cb) => {
    const origin = info.req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      cb(true);
    } else {
      cb(false, 403, "Not allowed by CORS");
    }
  },
});

// In-memory data store
let lastData: { [key: string]: any } = {
  matches: null,
  replays: null,
  sports: null,
};
let lastUpdate: { [key: string]: Date } = {
  matches: new Date(0),
  replays: new Date(0),
  sports: new Date(0),
};

// Fetch data from DB with projection
const fetchDataFromDB = async (endpoint: string) => {
  console.time(`fetchDataFromDB:${endpoint}`);
  const cacheKey = `cache:${endpoint}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.timeEnd(`fetchDataFromDB:${endpoint}`);
    return JSON.parse(cached);
  }

  if (mongoose.connection.readyState !== 1) {
    logger.warn(`Database not connected for ${endpoint}, reconnecting...`);
    await connectDB();
  }

  const db = mongoose.connection.db;
  if (!db) {
    logger.error(`Database connection failed for ${endpoint}`);
    throw new Error("Database connection failed");
  }
  const collection = db.collection(endpoint);
  const data = await collection
    .find()
    .project({ name: 1, date: 1, status: 1, createdAt: 1, _id: 0 }) // Select only necessary fields
    .limit(1000)
    .toArray();
  await redis.setEx(
    cacheKey,
    endpoint === "sports" ? 3600 : 300,
    JSON.stringify(data)
  );
  console.timeEnd(`fetchDataFromDB:${endpoint}`);
  return data;
};

// Broadcast WebSocket updates
const broadcastUpdate = (endpoint: string) => {
  if (wss.clients.size > 5000) {
    logger.warn(
      `Too many WebSocket clients (${wss.clients.size}), throttling broadcast`
    );
    return;
  }
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "data_updated",
          endpoint,
          timestamp: new Date().toISOString(),
        })
      );
    }
  });
};

// Check updates with data change detection
const checkUpdates = async () => {
  const now = new Date();
  const endpoints = [
    { name: "matches", interval: 30000 },
    { name: "replays", interval: 60000 },
    { name: "sports", interval: 600000 },
  ];

  for (const { name, interval } of endpoints) {
    if (now.getTime() - (lastUpdate[name]?.getTime() || 0) > interval) {
      try {
        const newData = await fetchDataFromDB(name);
        const newDataHash = require("crypto")
          .createHash("md5")
          .update(JSON.stringify(newData))
          .digest("hex");
        const oldDataHash = require("crypto")
          .createHash("md5")
          .update(JSON.stringify(lastData[name] || {}))
          .digest("hex");

        if (newDataHash !== oldDataHash) {
          logger.info(`Data changed for ${name}, broadcasting update`);
          broadcastUpdate(`/api/${name}`);
          lastData[name] = newData;
          lastUpdate[name] = now;
        }
      } catch (err) {
        logger.error(`Failed to fetch data for ${name}:`, err);
      }
    }
  }
};

setInterval(checkUpdates, 30000);

// WebSocket connection handling
wss.on("connection", (ws) => {
  logger.info("New WebSocket connection");
  ws.on("message", (message) => {
    ws.send(JSON.stringify({ type: "ack", message: "Message received" }));
  });
  ws.on("error", (error) =>
    logger.error("WebSocket error:", (error as any).message)
  );
  ws.on("close", () => logger.info("WebSocket connection closed"));
});

// Cluster for scalability
if (cluster.isPrimary) {
  logger.info(
    `Master ${process.pid} is running with ${Math.min(numCPUs, 4)} workers`
  );
  for (let i = 0; i < Math.min(numCPUs, 4); i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    logger.warn(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`
    );
    setTimeout(() => cluster.fork(), 1000);
  });
} else {
  const workerRedis = createClient({ url: process.env.REDIS_URL });
  workerRedis
    .connect()
    .catch((err) => logger.error("Worker Redis connection failed:", err));
  server.listen(PORT, async () => {
    logger.info(
      `Worker ${process.pid} running on http://localhost:${PORT} and ws://localhost:${PORT}/ws`
    );
    await connectDB();
    startPolling().catch((err) => logger.error("Polling error:", err));
  });
}

// Global error handlers
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
