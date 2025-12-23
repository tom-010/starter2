// Single source of truth for user roles
// Add new roles here - they'll be available in types automatically

export const ROLES = ["user", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLES: Role[] = ["user"];

export function isValidRole(role: string): role is Role {
  return ROLES.includes(role as Role);
}

// Parse JSON string from DB to typed array
export function parseRoles(rolesJson: string | null): Role[] {
  if (!rolesJson) return [...DEFAULT_ROLES];
  try {
    const parsed = JSON.parse(rolesJson);
    if (!Array.isArray(parsed)) return [...DEFAULT_ROLES];
    return parsed.filter(isValidRole);
  } catch {
    return [...DEFAULT_ROLES];
  }
}

// Serialize roles array to JSON for DB
export function serializeRoles(roles: Role[]): string {
  return JSON.stringify(roles);
}

export function hasRole(rolesJson: string | null, role: Role): boolean {
  return parseRoles(rolesJson).includes(role);
}
