import { log } from "@logtail/next";

import env from "@/config/server.env";

type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private log(level: LogLevel, message: string, ...args: any[]) {
    const logMessage = `[${this.context}] ${message}`;

    if (env.NODE_ENV === "development") {
      // if (level === "info") console.dir(args, { depth: null, colors: true });
      // else console[level](logMessage, JSON.stringify(args, null, 2));
      console[level](logMessage, JSON.stringify(args, null, 2));
    } else {
      log[level](logMessage, ...args);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, ...args: any[]) {
    this.log("debug", message, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, ...args: any[]) {
    this.log("info", message, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, ...args: any[]) {
    this.log("warn", message, ...args);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, ...args: any[]) {
    this.log("error", message, ...args);
  }
}

export const logger = (context: string) => new Logger(context);
