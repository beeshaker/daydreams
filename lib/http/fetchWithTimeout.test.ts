import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchWithTimeout, TimeoutError } from "./fetchWithTimeout";

describe("fetchWithTimeout", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    global.fetch = originalFetch;
  });

  it("throws TimeoutError when the underlying fetch hangs past the timeout", async () => {
    global.fetch = vi.fn((_input: unknown, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("This operation was aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    }) as unknown as typeof fetch;

    const promise = fetchWithTimeout("https://example.com", {}, 50);
    const assertion = expect(promise).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(50);
    await assertion;
  });

  it("resolves normally when fetch completes before the timeout", async () => {
    const response = new Response("ok");
    global.fetch = vi.fn(() => Promise.resolve(response)) as unknown as typeof fetch;

    const result = await fetchWithTimeout("https://example.com", {}, 50);
    expect(result).toBe(response);
  });
});
