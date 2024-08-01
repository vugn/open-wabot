import pino from "pino";
import fs from "fs";
import path from "path";

// Define log file path
const logFilePath = path.join(__dirname, "../logs", "app.log");

// Ensure the logs directory exists
const logsDir = path.dirname(logFilePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create a Pino logger instance with multiple destinations
const logger = pino(
  {
    level: "debug", // Set the default logging level
    formatters: {
      // Format log entries
      level: (label: string) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime, // Add timestamp to logs
    prettyPrint:
      process.env.NODE_ENV !== "production"
        ? {
            colorize: true, // Colorize output for development
            translateTime: "SYS:standard", // Human-readable time format
            ignore: "pid,hostname", // Ignore PID and hostname
          }
        : false, // Disable pretty print in production
  },
  pino.multistream([
    { stream: pino.destination(1) }, // Console stream
    { stream: pino.destination(logFilePath) }, // File stream
  ])
);

// Export the logger instance
export default logger;
