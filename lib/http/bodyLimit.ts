export class PayloadTooLargeError extends Error {}

/**
 * Rejects a request early, based on its declared `Content-Length`, if the
 * body would exceed `maxBytes`. This is a cheap header-only check (it does
 * not read/buffer the body), so it can't catch a request that lies about
 * its length or omits the header — it's a first line of defense against
 * accidentally/casually oversized payloads, not a hard guarantee.
 */
export function assertBodySizeFromHeader(request: Request, maxBytes: number): void {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new PayloadTooLargeError(`Request body exceeds ${maxBytes} bytes`);
  }
}
