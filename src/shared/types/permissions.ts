export type StaffStatus = "active" | "on_leave" | "suspended" | "dismissed";

export type PermissionEffect = "allow" | "deny";

export interface PermissionContext {
  projectId: string;
  userId: string;
  staffMembershipId: string;
}

export interface EffectivePermission {
  permissionKey: string;
  allowed: boolean;
  source: "position" | "individual";
}
