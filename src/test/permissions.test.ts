import { describe, expect, it } from "vitest";
import { can } from "@/lib/clinic";

describe("role permissions", () => {
  it("admin can manage staff", () => expect(can("admin", "staff:manage")).toBe(true));
  it("receptionist cannot manage staff", () => expect(can("receptionist", "staff:manage")).toBe(false));
  it("dentist cannot manage staff", () => expect(can("dentist", "staff:manage")).toBe(false));
  it("receptionist can add patients and book", () => {
    expect(can("receptionist", "patients:write")).toBe(true);
    expect(can("receptionist", "appointments:write")).toBe(true);
  });
  it("dentist cannot add patients or book", () => {
    expect(can("dentist", "patients:write")).toBe(false);
    expect(can("dentist", "appointments:write")).toBe(false);
  });
  it("dentist can update appointment status", () => expect(can("dentist", "appointments:status")).toBe(true));
  it("signed-out user can do nothing", () => expect(can(undefined, "appointments:status")).toBe(false));
});
