import { describe, expect, it } from "vitest";
import { postFormSchema } from "./post-form";

describe("post form validation", () => {
  it("rejects a blank title after trimming", () => {
    const result = postFormSchema.safeParse({ title: "   ", content: "A useful body." });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.title).toEqual(["Enter a title."]);
    }
  });

  it("rejects blank content", () => {
    const result = postFormSchema.safeParse({ title: "A title", content: "\n" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.content).toEqual(["Write some content."]);
    }
  });

  it("enforces the documented maximum lengths", () => {
    const result = postFormSchema.safeParse({
      title: "x".repeat(161),
      content: "x".repeat(20001),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.title).toEqual(["Use at most 160 characters."]);
      expect(errors.content).toEqual(["Use at most 20,000 characters."]);
    }
  });

  it("returns trimmed values for a valid note", () => {
    const result = postFormSchema.parse({ title: "  A title  ", content: "  Body  " });

    expect(result).toEqual({ title: "A title", content: "Body" });
  });
});
