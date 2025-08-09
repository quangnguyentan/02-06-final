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
import mongoose from "mongoose";
import logger from "./src/utils/logger";
import async, { AsyncQueue } from "async";
import { createHash } from "crypto";
import compression from "compression";
import { startPolling } from "./seed";

process.env.TZ = "Asia/Ho_Chi_Minh";
dotenv.config();

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
    }, 10000); // 10 seconds timeout
    try {
      await new Promise<void>((resolve) => {
        next();
        resolve();
      });
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
  1 // Single concurrency for strict FIFO
);

// Queue middleware
const queueMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.info(
    `Adding request to queue: ${req.url} (Queue length: ${requestQueue.length()})`
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
  max: 1000,
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
app.use(queueMiddleware); // Apply queue to all routes
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(compression({ level: 6 }));
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
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

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
      expiry: Date.now() + 60 * 1000, // 1 minute cache
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
    estimatedWaitTime: requestQueue.length() * 0.3, // Assume 0.3s per request
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
    .limit(500) // Reduced limit to decrease load
    .toArray();

  if (data.length > 0) {
    cache[cacheKey] = {
      data,
      expiry: Date.now() + 60 * 1000, // 1 minute cache
    };
    logger.info(`Cache miss for ${endpoint}, data fetched from DB`);
  } else {
    logger.warn(`No data found for ${endpoint}`);
  }
  return data;
};

// Broadcast updates
const broadcastUpdate = (endpoint: string): void => {
  if (wss.clients.size > 500) {
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
    { name: "matches", interval: 120000 }, // 2 minutes
    { name: "replays", interval: 300000 }, // 5 minutes
    { name: "sports", interval: 900000 }, // 15 minutes
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
}, 120000); // 2 minutes

// Monitor queue length
setInterval(() => {
  logger.info(`Queue length: ${requestQueue.length()}`);
}, 120000); // 2 minutes

setInterval(checkUpdates, 60000); // 1 minute

// WebSocket handling
wss.on("connection", (ws: WebSocket) => {
  if (wss.clients.size >= 500) {
    ws.close(1001, "Too many connections");
    return;
  }
  logger.info("New WebSocket connection");
  ws.send(
    JSON.stringify({
      type: "queue_status",
      position: requestQueue.length(),
      estimatedWaitTime: requestQueue.length() * 0.3,
    })
  );
  const interval = setInterval(() => {
    ws.send(
      JSON.stringify({
        type: "queue_status",
        position: requestQueue.length(),
        estimatedWaitTime: requestQueue.length() * 0.3,
      })
    );
  }, 10000); // 10 seconds
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
    const desiredIndexes: {
      [key: string]: { key: any; name: string; unique?: boolean; sparse?: boolean }[];
    } = {
      matches: [
        { key: { date: -1, status: 1 }, name: "matches_date_status_idx" },
      ],
      replays: [
        { key: { date: -1 }, name: "replays_date_idx" },
      ],
      sports: [
        { key: { name: 1 }, name: "sports_name_idx", unique: true },
      ],
      "video-reels": [
        { key: { createdAt: -1 }, name: "video_reels_idx" },
      ],
      banners: [
        { key: { createdAt: -1 }, name: "banners_idx" },
      ],
    };

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const existingIndexes = await collection.indexes();

      for (const indexSpec of desiredIndexes[collectionName] || []) {
        const indexExists = existingIndexes.some(
          (idx: any) =>
            idx.name === indexSpec.name ||
            JSON.stringify(idx.key) === JSON.stringify(indexSpec.key)
        );

        if (!indexExists) {
          await collection.createIndex(indexSpec.key, {
            name: indexSpec.name,
            unique: indexSpec.unique || false,
            sparse: indexSpec.sparse || false,
            background: true,
          });
          logger.info(`Created index ${indexSpec.name} on ${collectionName}`);
        } else {
          logger.info(`Index ${indexSpec.name} already exists on ${collectionName}`);
        }
      }
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Error setting up indexes: ${error.message}`);
  }
}

// Start server
server.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  try {
    await connectDB();
    await setupIndexes();
    await startPolling().catch((err: Error) =>
      logger.error("Polling error:", err.message)
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`Server failed to start: ${error.message}`);
  }
});

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
  });