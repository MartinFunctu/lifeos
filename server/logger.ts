import { format } from "date-fns";
import dotenv from "dotenv";

dotenv.config();

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

const validLevels: LogLevel[] = ["DEBUG", "INFO", "WARN", "ERROR"];

const isLogLevel = (level: string): level is LogLevel => {
    return validLevels.includes(level as LogLevel);
}

const configuredLevel = process.env.LOG_LEVEL || "INFO";
const initialLevel = isLogLevel(configuredLevel) ? configuredLevel : "INFO";

const levels: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

export class Logger {
    private level: LogLevel = initialLevel;

    constructor(level?: LogLevel) {
        if (level) {
            this.level = level;
        }
    }

    setLevel(level: LogLevel) {
        this.level = level;
    }

    private formatMessage(level: LogLevel, message: string, source: string = "server", meta?: any): string {
        const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        const metaString = meta ? ` ${JSON.stringify(meta)}` : "";
        return `[${timestamp}] [${level}] [${source}] ${message}${metaString}`;
    }

    debug(message: string, source?: string, meta?: any) {
        if (levels[this.level] <= levels.DEBUG) {
            console.debug(this.formatMessage("DEBUG", message, source, meta));
        }
    }

    info(message: string, source?: string, meta?: any) {
        if (levels[this.level] <= levels.INFO) {
            console.info(this.formatMessage("INFO", message, source, meta));
        }
    }

    warn(message: string, source?: string, meta?: any) {
        if (levels[this.level] <= levels.WARN) {
            console.warn(this.formatMessage("WARN", message, source, meta));
        }
    }

    error(message: string, source?: string, meta?: any) {
        if (levels[this.level] <= levels.ERROR) {
            console.error(this.formatMessage("ERROR", message, source, meta));
        }
    }
}

export const logger = new Logger();
