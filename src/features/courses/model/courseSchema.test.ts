import { describe, expect, it } from "vitest";
import { courseFormSchema } from "./courseSchema";

const valid = {
  name: "Adare Manor",
  city: "Limerick",
  country: "IE",
  par: 72,
  difficulty: 4,
  featured: false,
  teeLengthMen: null,
  teeLengthWomen: null,
};

const parError = (par: unknown) => {
  const result = courseFormSchema.safeParse({ ...valid, par });
  return result.success ? null : result.error.issues.find((issue) => issue.path[0] === "par")?.message;
};

describe("courseFormSchema", () => {
  it("accepts a complete course", () => {
    expect(courseFormSchema.safeParse(valid).success).toBe(true);
  });

  it("tells an empty par apart from one that isn't a number", () => {
    expect(parError(undefined)).toBe("Par required");
    expect(parError(Number.NaN)).toBe("Par must be a number"); // the form turns "abc" into NaN
    expect(parError(72.5)).toBe("Par must be a whole number");
    expect(parError(72)).toBeNull();
  });

  it("rejects a blank name and city", () => {
    const result = courseFormSchema.safeParse({ ...valid, name: "   ", city: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(["name", "city"]);
  });
});
