export function can(role: string, allowedRoles: readonly string[]) {
  return allowedRoles.includes(role);
}
