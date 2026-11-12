import { describe, expect, it } from "vitest";
import { extractRoles, permissionsFor } from "./roles";

describe("role permissions", () => {
  it("gives readers no editing capability", () => {
    expect(permissionsFor(["reader"])).toEqual({
      canCreate: false,
      canEdit: false,
      canDelete: false,
    });
  });

  it("lets editors create and edit but not delete", () => {
    expect(permissionsFor(["editor"])).toEqual({
      canCreate: true,
      canEdit: true,
      canDelete: false,
    });
  });

  it("lets administrators perform every editorial action", () => {
    expect(permissionsFor(["administrator"])).toEqual({
      canCreate: true,
      canEdit: true,
      canDelete: true,
    });
  });

  it("reads roles from direct claims and nested realm access", () => {
    expect(
      extractRoles({ roles: ["editor"], realm_access: { roles: ["reader", "administrator"] } }),
    ).toEqual(["editor", "reader", "administrator"]);
  });

  it("ignores unknown claims and malformed profiles", () => {
    expect(extractRoles({ roles: ["owner", 42] })).toEqual([]);
    expect(extractRoles(null)).toEqual([]);
  });
});
