export const DEFAULTS = {
  downloadConcurrency: parseInt(process.env["SEED_DOWNLOAD_CONCURRENCY"] || "5", 10),
  maxImageBytes: parseInt(process.env["SEED_MAX_IMAGE_SIZE_BYTES"] || "5242880", 10),
  placeholderComic: "/placeholder-comic.jpg",
  placeholderUser: "/shadcn.jpg",
  bcryptRounds: parseInt(process.env["SEED_BCRYPT_ROUNDS"] || "10", 10),
};
