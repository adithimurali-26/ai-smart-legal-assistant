import dotenv from "dotenv";
import path from "path";

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  clientPort: parseInt(process.env.CLIENT_PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  sessionSecret: process.env.SESSION_SECRET || "legal_assistant_session_secret_2026",
  jwtSecret: process.env.JWT_SECRET || "legal_assistant_jwt_secret_2026",
  llmProvider: process.env.LLM_PROVIDER || "gemini",
  llmApiKey: process.env.LLM_API_KEY || "",
  llmModel: process.env.LLM_MODEL || "gemini-1.5-flash",
  embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-004",
  uploadsDir: path.resolve(process.cwd(), "uploads"),
  dataDir: path.resolve(process.cwd(), "data"),
};
