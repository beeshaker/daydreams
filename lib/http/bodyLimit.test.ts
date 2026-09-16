import { describe, it, expect } from "vitest";
import { assertBodySizeFromHeader, PayloadTooLargeError } from "./bodyLimit";

describe("assertBodySizeFromHeader", () => {
  it("throws PayloadTooLargeError when content-length exceeds the max", () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: { "content-length": "20001" },
    });
    expect(() => assertBodySizeFromHeader(request, 20000)).toThrow(PayloadTooLargeError);
  });

  it("does not throw when content-length is under the max", () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: { "content-length": "100" },
    });
    expect(() => assertBodySizeFromHeader(request, 20000)).not.toThrow();
  });

  it("does not throw when content-length equals the max", () => {
    const request = new Request("https://example.com", {
      method: "POST",
      headers: { "content-length": "20000" },
    });
    expect(() => assertBodySizeFromHeader(request, 20000)).not.toThrow();
  });

  it("does not throw when content-length header is absent", () => {
    const request = new Request("https://example.com", { method: "POST" });
    expect(() => assertBodySizeFromHeader(request, 20000)).not.toThrow();
  });
});
