import app from "./app";
import { config } from "./config/env";

const server = app.listen(config.port, () => {
  console.log(`Backend server running on http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

const gracefulShutdown = () => {
  console.log("Shutting down backend server gracefully...");
  server.close(() => {
    console.log("Backend server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
