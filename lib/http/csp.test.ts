import { describe, it, expect } from "vitest";
import { buildAdminCsp, buildPublicCsp, generateNonce } from "./csp";

function directive(csp: string, name: string): string[] {
  const entry = csp.split("; ").find((part) => part.split(" ")[0] === name);
  return entry ? entry.split(" ").slice(1) : [];
}

describe("csp", () => {
  it("locks down framing, plugins, base and form targets on public pages", () => {
    const csp = buildPublicCsp();
    expect(directive(csp, "frame-ancestors")).toEqual(["'none'"]);
    expect(directive(csp, "object-src")).toEqual(["'none'"]);
    expect(directive(csp, "base-uri")).toEqual(["'self'"]);
    expect(directive(csp, "form-action")).toEqual(["'self'"]);
  });

  it("allows the third parties public pages depend on", () => {
    const csp = buildPublicCsp();
    expect(directive(csp, "script-src")).toContain("https://challenges.cloudflare.com");
    expect(directive(csp, "connect-src")).toContain("wss://*.elevenlabs.io");
    expect(directive(csp, "frame-src")).toContain("https://www.google.com");
  });

  it("gives admin pages a nonce-only script policy with no third parties", () => {
    const csp = buildAdminCsp("abc123");
    const scriptSrc = directive(csp, "script-src");
    expect(scriptSrc).toContain("'nonce-abc123'");
    expect(scriptSrc).toContain("'strict-dynamic'");
    expect(scriptSrc).not.toContain("'unsafe-inline'");
    expect(csp).not.toMatch(/https:\/\//);
    expect(directive(csp, "connect-src")).toEqual(["'self'"]);
  });

  it("generates a fresh nonce each time", () => {
    expect(generateNonce()).not.toBe(generateNonce());
  });
});
