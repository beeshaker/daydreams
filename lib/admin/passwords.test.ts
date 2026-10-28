import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, verifyPasswordOrDummy } from "./passwords";

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

  it("takes as long to reject an unknown user as a wrong password", async () => {
    const realHash = await hashPassword("correct-horse-battery-staple");
    await verifyPasswordOrDummy("warm-up", undefined); // first call also builds the dummy hash

    const time = async (hash: string | undefined) => {
      const start = performance.now();
      expect(await verifyPasswordOrDummy("wrong-password", hash)).toBe(false);
      return performance.now() - start;
    };
    const wrongPassword = await time(realHash);
    const unknownUser = await time(undefined);
    expect(unknownUser).toBeGreaterThan(wrongPassword * 0.5);
  });
});
