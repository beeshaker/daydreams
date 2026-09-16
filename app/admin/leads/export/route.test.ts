import { describe, it, expect } from "vitest";
import { csvField } from "./route";

describe("csvField", () => {
  it("prefixes values starting with = to prevent formula injection", () => {
    expect(csvField("=cmd|'/c calc'!A1")).toBe("'=cmd|'/c calc'!A1");
  });

  it("prefixes values starting with +", () => {
    expect(csvField("+1+1")).toBe("'+1+1");
  });

  it("prefixes values starting with -", () => {
    expect(csvField("-1+1")).toBe("'-1+1");
  });

  it("prefixes values starting with @", () => {
    expect(csvField("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
  });

  it("prefixes values starting with a tab character", () => {
    expect(csvField("\t=1+1")).toBe("'\t=1+1");
  });

  it("prefixes values starting with a carriage return", () => {
    expect(csvField("\r=1+1")).toBe("'\r=1+1");
  });

  it("still quote/comma-escapes fields containing quotes and commas", () => {
    expect(csvField('He said "hi", then left')).toBe(
      '"He said ""hi"", then left"',
    );
  });

  it("passes plain fields through unchanged", () => {
    expect(csvField("John Smith")).toBe("John Smith");
  });

  it("returns an empty string for null/undefined", () => {
    expect(csvField(null)).toBe("");
    expect(csvField(undefined)).toBe("");
  });
});
