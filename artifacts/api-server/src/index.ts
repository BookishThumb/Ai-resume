import app from "./app";
import { logger } from "./lib/logger";

// Polyfills for pdf.js (used by pdf-parse >= 2)
// @ts-ignore
if (typeof globalThis.DOMMatrix === 'undefined') {
  // @ts-ignore
  globalThis.DOMMatrix = class DOMMatrix {} as any;
}
// @ts-ignore
if (typeof globalThis.ImageData === 'undefined') {
  // @ts-ignore
  globalThis.ImageData = class ImageData {} as any;
}
// @ts-ignore
if (typeof globalThis.Path2D === 'undefined') {
  // @ts-ignore
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
