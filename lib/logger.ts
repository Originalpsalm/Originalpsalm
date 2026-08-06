/**
 * Structured application logger — the only sanctioned console consumer
 * (enforced by ESLint's no-console rule everywhere else).
 *
 * Emits one JSON line per event so log aggregators can parse fields.
 * Sensitive keys are always redacted (Security spec: never log passwords
 * or tokens; mask sensitive information).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

const REDACTED_KEYS = new Set([
  "password",
  "passwordhash",
  "newpassword",
  "currentpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "secret",
  "jwt",
]);

function redact(context: LogContext): LogContext {
  const safe: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      safe[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      safe[key] = redact(value as LogContext);
    } else {
      safe[key] = value;
    }
  }

  return safe;
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? redact(context) : {}),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, context?: LogContext) => emit("error", message, context),
};
