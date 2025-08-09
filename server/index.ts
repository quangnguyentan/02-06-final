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
import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import { initRoutes } from "./src/routes/index.routes";
import path from "path";
import { connectDB } from "./src/configs/connectDB";
import cookieParser from "cookie-parser";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import rateLimit from "express-rate-limit";
import cluster from "cluster";
import os from "os";
import mongoose from "mongoose";
import { startPolling } from "./seed";
import logger from "./src/utils/logger";
import async, { AsyncQueue } from "async";
import { createHash } from "crypto";

process.env.TZ = "Asia/Ho_Chi_Minh";
dotenv.config();

const numCPUs: number = os.cpus().length;
const app = express();
const PORT: string | number = process.env.PORT ?? 8080;
const allowedOrigins: string[] = [
  "https://hoiquan.live",
  "http://localhost:5173",
  "http://192.168.1.5:5173",
  "http://51.79.181.110:5173",
];
const allowedDevIPs: string[] = ["127.0.0.1", "::1", "192.168.1.5"];

// Interface for queue task
interface QueueTask {
  req: Request;
  res: Response;
  next: NextFunction;
}

// Initialize queue with concurrency of 1 for strict FIFO processing
const requestQueue: AsyncQueue<QueueTask> = async.queue(
  async (task: QueueTask, callback: (error?: Error) => void) => {
    const { req, res, next } = task;
    const timeout = setTimeout(() => {
      logger.error(`Queue timeout for ${req.url}`);
      res.status(504).json({
        error: "Request timeout in queue",
        timestamp: new Date().toISOString(),
      });
      callback(new Error("Request timeout"));
    }, 5000); // 30 seconds timeout
    try {
      next();
      clearTimeout(timeout);
      callback();
    } catch (error: unknown) {
      clearTimeout(timeout);
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Queue error for ${req.url}: ${err.message}`);
      res.status(500).json({
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      });
      callback(err);
    }
  },
  50
); // Process one request at a time

// Queue middleware
const queueMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.info(
    `Adding request to queue: ${
      req.url
    } (Queue length: ${requestQueue.length()})`
  );
  requestQueue.push({ req, res, next }, (err: Error | null | undefined) => {
    if (err) {
      logger.error(`Queue processing error for ${req.url}: ${err.message}`);
    }
  });
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20000, // Tăng lên 20,000 yêu cầu/15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Rate limit exceeded. Please wait a few minutes and try again.",
    retryAfter: 5,
    timestamp: new Date().toISOString(),
  },
  skip: (req: Request) => allowedDevIPs.includes(req.ip ?? ""),
  handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
    logger.warn(`Rate limit hit by IP: ${req.ip} for ${req.url}`);
    res.status(429).json(options.message);
  },
});

const criticalEndpointLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5000, // Tăng lên 5,000 yêu cầu/phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Rate limit exceeded for this endpoint. Please wait and try again.",
    retryAfter: 5,
    timestamp: new Date().toISOString(),
  },
  skip: (req: Request) => allowedDevIPs.includes(req.ip ?? ""),
  handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
    logger.warn(`Rate limit hit by IP: ${req.ip} for ${req.url}`);
    res.status(429).json(options.message);
  },
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
  allowedHeaders: ["Content-Type", "Authorization", "If-None-Match"],
  optionsSuccessStatus: 200,
};

// Middleware
app.use(limiter);
app.use("/api/matches", queueMiddleware, criticalEndpointLimiter);
app.use("/api/replays", queueMiddleware, criticalEndpointLimiter);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, "public"), {
    etag: true,
    lastModified: true,
    setHeaders: (res: Response, path: string) => {
      if (/\.(jpg|jpeg|png|gif|svg|webp|ico)$/.test(path)) {
        res.setHeader("Cache-Control", "public, max-age=31536000");
      }
    },
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.ip} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// In-memory cache
interface CacheEntry {
  data: any;
  expiry: number;
}
const cache: { [key: string]: CacheEntry } = {};
const etags: { [key: string]: string } = {};

// ETag middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const endpoint = req.path;
  const clientEtag = req.headers["if-none-match"];
  if (clientEtag && etags[endpoint] === clientEtag) {
    res.status(304).end();
    return;
  }
  res.locals.setETag = (data: any) => {
    const etag = createHash("md5").update(JSON.stringify(data)).digest("hex");
    etags[endpoint] = etag;
    cache[endpoint] = {
      data,
      expiry:
        Date.now() + (endpoint === "/api/sports" ? 600 * 1000 : 60 * 1000),
    };
    res.set("ETag", etag);
  };
  next();
});

// Initialize routes
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Football API Server" });
});

// Queue status endpoint
app.get("/api/queue-status", (_req: Request, res: Response) => {
  res.json({
    position: requestQueue.length(),
    estimatedWaitTime: requestQueue.length() * 0.5, // Assume 0.5s per request
  });
});

// Cache clear endpoint
app.post("/api/clear-cache", (req: Request, res: Response) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (
    endpoint &&
    ["matches", "replays", "sports", "video-reels", "banners"].includes(
      endpoint
    )
  ) {
    delete cache[`cache:${endpoint}`];
    delete etags[`/api/${endpoint}`];
    logger.info(`Cache cleared for ${endpoint}`);
    res.json({ message: `Cache cleared for ${endpoint}` });
  } else {
    res.status(400).json({ error: "Invalid endpoint" });
  }
});

initRoutes(app);

// Error handling
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Request error: ${err.message}`);
  res.status(err.name === "NotAllowedError" ? 403 : 500).json({
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

// HTTP and WebSocket server
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

// Data store
const lastData: { [key: string]: any } = {
  matches: null,
  replays: null,
  sports: null,
};
const lastUpdate: { [key: string]: Date } = {
  matches: new Date(0),
  replays: new Date(0),
  sports: new Date(0),
};

// Fetch data from DB
const fetchDataFromDB = async (endpoint: string): Promise<any[]> => {
  const cacheKey = `cache:${endpoint}`;
  const cached = cache[cacheKey];
  if (cached && cached.expiry > Date.now()) {
    logger.info(`Cache hit for ${endpoint}`);
    return cached.data;
  }

  if (mongoose.connection.readyState !== 1) {
    logger.warn(`Database not connected for ${endpoint}, reconnecting...`);
    await connectDB();
  }

  const db = mongoose.connection.db;
  if (!db) throw new Error("Database connection failed");

  const collection = db.collection(endpoint);
  const data = await collection
    .find({})
    .project({ name: 1, date: 1, status: 1, createdAt: 1, _id: 0 })
    .limit(1000)
    .toArray();

  cache[cacheKey] = {
    data,
    expiry: Date.now() + (endpoint === "sports" ? 600 * 1000 : 60 * 1000),
  };
  logger.info(`Cache miss for ${endpoint}, data fetched from DB`);
  return data;
};

// Broadcast updates
const broadcastUpdate = (endpoint: string): void => {
  if (wss.clients.size > 1000) {
    logger.warn(`Too many WebSocket clients (${wss.clients.size})`);
    return;
  }
  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
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

// Check updates
const checkUpdates = async (): Promise<void> => {
  const endpoints: { name: string; interval: number }[] = [
    { name: "matches", interval: 60000 },
    { name: "replays", interval: 120000 },
    { name: "sports", interval: 600000 },
  ];

  for (const { name, interval } of endpoints) {
    if (Date.now() - lastUpdate[name].getTime() > interval) {
      try {
        const newData = await fetchDataFromDB(name);
        const newDataHash = createHash("md5")
          .update(JSON.stringify(newData))
          .digest("hex");
        const oldDataHash = createHash("md5")
          .update(JSON.stringify(lastData[name] || {}))
          .digest("hex");

        if (newDataHash !== oldDataHash) {
          logger.info(`Data changed for ${name}, broadcasting update`);
          broadcastUpdate(`/api/${name}`);
          lastData[name] = newData;
          lastUpdate[name] = new Date();
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        logger.error(`Failed to fetch data for ${name}: ${error.message}`);
      }
    }
  }
};

// Cache cleanup
setInterval(() => {
  for (const key in cache) {
    if (cache[key].expiry < Date.now()) {
      delete cache[key];
      logger.info(`Cache cleared for ${key}`);
    }
  }
}, 60000);

// Monitor queue length
setInterval(() => {
  logger.info(`Queue length: ${requestQueue.length()}`);
}, 60000);

setInterval(checkUpdates, 30000);

// WebSocket handling
wss.on("connection", (ws: WebSocket) => {
  if (wss.clients.size >= 1000) {
    ws.close(1001, "Too many connections");
    return;
  }
  logger.info("New WebSocket connection");
  ws.send(
    JSON.stringify({
      type: "queue_status",
      position: requestQueue.length(),
      estimatedWaitTime: requestQueue.length() * 0.5,
    })
  );
  const interval = setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "queue_status",
        position: requestQueue.length(),
        estimatedWaitTime: requestQueue.length() * 0.5,
      })
    );
  }, 5000);
  ws.on("message", (message: string | Buffer) => {
    ws.send(JSON.stringify({ type: "ack", message: "Message received" }));
  });
  ws.on("error", (error: Error) =>
    logger.error(`WebSocket error: ${error.message}`)
  );
  ws.on("close", () => {
    logger.info("WebSocket connection closed");
    clearInterval(interval);
  });
});

// MongoDB indexes
async function setupIndexes(): Promise<void> {
  await connectDB();
  const db = mongoose.connection.db;
  if (!db) {
    logger.error("Database connection failed, cannot create indexes");
    return;
  }

  try {
    const collections: string[] = [
      "matches",
      "replays",
      "sports",
      "video-reels",
      "banners",
    ];
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const existingIndexes = await collection.indexes();

      const desiredIndexes: {
        [key: string]: { key: any; name: string; unique?: boolean }[];
      } = {
        matches: [
          { key: { name: 1, date: -1, status: 1 }, name: "matches_idx" },
        ],
        replays: [
          { key: { name: 1, date: -1, status: 1 }, name: "replays_idx" },
        ],
        sports: [{ key: { name: 1 }, name: "sports_name_idx", unique: true }],
        "video-reels": [{ key: { createdAt: -1 }, name: "video_reels_idx" }],
        banners: [{ key: { createdAt: -1 }, name: "banners_idx" }],
      };

      const indexesToCreate = desiredIndexes[collectionName] || [];

      for (const indexSpec of indexesToCreate) {
        const indexExists = existingIndexes.some(
          (idx: any) =>
            idx.name === indexSpec.name ||
            JSON.stringify(idx.key) === JSON.stringify(indexSpec.key)
        );

        if (!indexExists) {
          try {
            await collection.createIndex(indexSpec.key, {
              name: indexSpec.name,
              unique: indexSpec.unique || false,
              background: true,
            });
            logger.info(`Created index ${indexSpec.name} on ${collectionName}`);
          } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error(
              `Failed to create index ${indexSpec.name} on ${collectionName}: ${error.message}`
            );
          }
        } else {
          logger.info(
            `Index ${indexSpec.name} already exists on ${collectionName}`
          );
        }
      }
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Error setting up indexes: ${error.message}`);
  }
}

// Cluster
if (cluster.isPrimary) {
  logger.info(`Master ${process.pid} is running with ${numCPUs} workers`);
  for (let i = 0; i < Math.max(numCPUs * 4, 8); i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    logger.warn(`Worker ${worker.process.pid} died. Restarting...`);
    setTimeout(() => cluster.fork(), 1000);
  });
} else {
  server.listen(PORT, async () => {
    logger.info(`Worker ${process.pid} running on port ${PORT}`);
    try {
      await connectDB();
      await setupIndexes();
      await startPolling().catch((err: Error) =>
        logger.error("Polling error:", err.message)
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(`Worker ${process.pid} failed to start: ${error.message}`);
    }
  });
}

// Global error handlers
process.on("uncaughtException", (err: Error) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on(
  "unhandledRejection",
  (reason: unknown, promise: Promise<unknown>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error(
      `Unhandled Rejection at: ${promise}, reason: ${error.message}`
    );
  }
);
