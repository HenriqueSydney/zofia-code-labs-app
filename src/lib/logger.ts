import pino from "pino";


const createLoggerConfig = (prefix: string) => ({
  msgPrefix: prefix,
  nestedKey: 'payload',
  level: process.env.LOG_LEVEL || "info",
  timestamp: (): string => `,"time":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    level: (label: string): { level: string } => {
      return { level: label.toUpperCase() };
    }
  }
});

export const webLogger = pino(createLoggerConfig('[WEB] '));
export const apiLogger = pino(createLoggerConfig('[API] '));