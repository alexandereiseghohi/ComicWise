export interface Logger {
  info(message: string): void;
  error(message: string): void;
  warn(message: string): void;
}

export const defaultLogger: Logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`),
};
