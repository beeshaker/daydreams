import { describe, it, expect } from "vitest";
import { parseLeadPayload } from "./schema";

const base = {
  source: "traditional-site",
  parentName: "Test Parent",
  email: "test@example.com",
  consent: true,
};

describe("parseLeadPayload", () => {
  it("accepts general enquiries from the contact form", () => {
    const result = parseLeadPayload({ ...base, leadType: "general-enquiry", message: "[Parties & events] A birthday in May" });
    expect(result.success).toBe(true);
  });

  it("rejects unknown lead types", () => {
    expect(parseLeadPayload({ ...base, leadType: "spam" }).success).toBe(false);
  });
});
