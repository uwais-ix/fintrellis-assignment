export const ROLES = ["reader", "editor", "administrator"] as const;

export type Role = (typeof ROLES)[number];

export const roleLabels: Record<Role, string> = {
  reader: "Reader",
  editor: "Editor",
  administrator: "Administrator",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function permissionsFor(roles: Role[]) {
  const canEdit = roles.includes("editor") || roles.includes("administrator");
  return {
    canCreate: canEdit,
    canEdit,
    canDelete: roles.includes("administrator"),
  };
}

export function extractRoles(profile: unknown): Role[] {
  if (typeof profile !== "object" || profile === null) return [];
  const record = profile as Record<string, unknown>;
  const direct = Array.isArray(record.roles) ? record.roles : [];
  const realmAccess = record.realm_access;
  const nested =
    typeof realmAccess === "object" && realmAccess !== null
      ? (realmAccess as Record<string, unknown>).roles
      : undefined;
  const realm = Array.isArray(nested) ? nested : [];
  return [...new Set([...direct, ...realm].filter(isRole))];
}
