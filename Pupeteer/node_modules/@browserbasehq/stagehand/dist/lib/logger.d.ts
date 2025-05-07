import pino from "pino";
import { LogLine } from "../types/log";
export interface LoggerOptions {
    pretty?: boolean;
    level?: pino.Level;
    destination?: pino.DestinationStream;
    usePino?: boolean;
}
/**
 * Creates a configured Pino logger instance
 */
export declare function createLogger(options?: LoggerOptions): import("pino/pino").Logger<never, boolean>;
/**
 * StagehandLogger class that wraps Pino for our specific needs
 */
export declare class StagehandLogger {
    private logger;
    private verbose;
    private externalLogger?;
    private usePino;
    private isTest;
    constructor(options?: LoggerOptions, externalLogger?: (logLine: LogLine) => void);
    /**
     * Set the verbosity level
     */
    setVerbosity(level: 0 | 1 | 2): void;
    /**
     * Log a message using our LogLine format
     */
    log(logLine: LogLine): void;
    /**
     * Helper to format auxiliary data for structured logging
     */
    private formatAuxiliaryData;
    /**
     * Convenience methods for different log levels
     */
    error(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    /**
     * Convert a plain object to our auxiliary format
     */
    private convertToAuxiliary;
}
