import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  sessionCookieName: process.env.SESSION_COOKIE_NAME || "session_token",
  sessionMaxAgeMs: parseInt(process.env.SESSION_MAX_AGE_MS || String(7 * 24 * 60 * 60 * 1000), 10),
};
