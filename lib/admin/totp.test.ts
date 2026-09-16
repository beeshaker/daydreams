import { describe, it, expect } from "vitest";
import { generate } from "otplib";
import { generateTotpSecret, verifyTotpCode, buildOtpAuthQrCode } from "./totp";

describe("totp", () => {
  it("generates a secret and verifies a code produced for it", async () => {
    const secret = generateTotpSecret();
    const code = await generate({ secret });
    expect(await verifyTotpCode(secret, code)).toBe(true);
  });

  it("rejects an incorrect code", async () => {
    const secret = generateTotpSecret();
    expect(await verifyTotpCode(secret, "000000")).toBe(false);
  });

  it("rejects a malformed code without throwing", async () => {
    const secret = generateTotpSecret();
    expect(await verifyTotpCode(secret, "not-a-code")).toBe(false);
  });

  it("builds a scannable QR code data URL", async () => {
    const secret = generateTotpSecret();
    const dataUrl = await buildOtpAuthQrCode("admin", secret);
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
