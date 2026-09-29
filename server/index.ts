import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config/env";
import { initDatabase } from "./models/db";
import { seedInitialData } from "./data/seedData";
import apiRoutes from "./routes/api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // 1. Initialize database and initial seed
  await initDatabase();
  await seedInitialData();

  const app = express();
  const server = createServer(app);

  // 2. Core Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(cookieParser(config.sessionSecret));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 3. API Routes
  app.use("/api", apiRoutes);

  // 4. Production Static Serving
  const staticPath =
    config.nodeEnv === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  if (config.nodeEnv === "production") {
    app.use(express.static(staticPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticPath, "index.html"));
    });
  } else {
    // In development, handle direct fallback if accessed on backend port
    app.get("/", (_req, res) => {
      res.json({
        message: "AI Smart Legal Assistant API Server Running",
        health: "/api/health",
        frontend: `http://localhost:${config.clientPort}`,
      });
    });
  }

  const port = config.port;
  server.listen(port, () => {
    console.log(`[SERVER] Legal Intelligence API running on http://localhost:${port}/`);
    console.log(`[SERVER] Connected to ${config.nodeEnv} environment.`);
  });
}

startServer().catch((err) => {
  console.error("[SERVER] Startup failed:", err);
  process.exit(1);
});
