import { afterEach, describe, it, expect, vi } from "vitest";
import { verifyTurnstileToken } from "./verify";

describe("verifyTurnstileToken without a secret key", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails closed in production", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("NODE_ENV", "production");
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verifyTurnstileToken("token", "203.0.113.1")).toBe(false);
  });

  it("is skipped outside production so local dev works", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await verifyTurnstileToken(undefined, "203.0.113.1")).toBe(true);
  });
});
