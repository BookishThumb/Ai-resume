import app from "./app";
import { logger } from "./lib/logger";

// Polyfills for pdf.js (used by pdf-parse >= 2)
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {} as any;
}
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = class ImageData {} as any;
}
if (typeof globalThis.Path2D === 'undefined') {
  globalThis.Path2D = class Path2D {} as any;
}

const rawPort = process.env["PORT"] || "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
