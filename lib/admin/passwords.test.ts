import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./passwords";

describe("passwords", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces a different hash each time (salted)", async () => {
    const hashA = await hashPassword("same-password");
    const hashB = await hashPassword("same-password");
    expect(hashA).not.toEqual(hashB);
  });
});
