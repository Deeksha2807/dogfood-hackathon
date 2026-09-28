import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { eventRouter } from "./modules/events/event.routes";

const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check endpoints
const healthHandler = (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

// Mount feature routers
app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);

// 404 handler for unrecognized routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Endpoint not found",
  });
});

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
  const message =
    statusCode === 500 && config.nodeEnv === "production"
      ? "Internal server error"
      : err.message || "An unexpected error occurred.";

  res.status(statusCode).json({
    error: err.code || "INTERNAL_SERVER_ERROR",
    message,
    ...(err.details ? { details: err.details } : {}),
  });
});

export default app;
