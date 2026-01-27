export type Logger = {
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
};

export const createLogger = (prefix = "seeder"): Logger => ({
  info: (...args: any[]) => console.log(`[${prefix}]`, ...args),
  warn: (...args: any[]) => console.warn(`[${prefix}]`, ...args),
  error: (...args: any[]) => console.error(`[${prefix}]`, ...args),
});

export default createLogger;
