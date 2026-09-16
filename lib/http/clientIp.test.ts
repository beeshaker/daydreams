import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ORIGINAL_ENV = process.env.TRUSTED_PROXY_HOPS;

async function loadGetClientIp() {
  vi.resetModules();
  const mod = await import("./clientIp");
  return mod.getClientIp;
}

describe("getClientIp", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) {
      delete process.env.TRUSTED_PROXY_HOPS;
    } else {
      process.env.TRUSTED_PROXY_HOPS = ORIGINAL_ENV;
    }
  });

  it('returns "unknown" when no relevant headers are present', async () => {
    const getClientIp = await loadGetClientIp();
    const request = new Request("https://example.com", { headers: {} });
    expect(getClientIp(request)).toBe("unknown");
  });

  it("returns the x-real-ip value when only that header is set", async () => {
    const getClientIp = await loadGetClientIp();
    const request = new Request("https://example.com", {
      headers: { "x-real-ip": "203.0.113.5" },
    });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });

  it("returns the rightmost trusted hop from x-forwarded-for, not the client-supplied first entry", async () => {
    process.env.TRUSTED_PROXY_HOPS = "1";
    const getClientIp = await loadGetClientIp();
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.5" },
    });
    expect(getClientIp(request)).toBe("10.0.0.5");
  });

  it("prefers x-real-ip over x-forwarded-for when both are present", async () => {
    const getClientIp = await loadGetClientIp();
    const request = new Request("https://example.com", {
      headers: {
        "x-real-ip": "203.0.113.5",
        "x-forwarded-for": "9.9.9.9, 10.0.0.5",
      },
    });
    expect(getClientIp(request)).toBe("203.0.113.5");
  });
});
