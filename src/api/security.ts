import { apiRequest, downloadFile, uploadFormData } from "./client";
import type {
  Backup,
  PaginatedAuditLogs,
  PaginatedBackups,
  Permission,
  PermissionCreateRequest,
  RestoreRequest,
  RestoreResult,
  Role,
  RoleCreateRequest,
} from "../types/api";

// --- Roles ---

export function listRoles() {
  return apiRequest<Role[]>("/security/roles");
}

export function createRole(body: RoleCreateRequest) {
  return apiRequest<Role>("/security/roles", { method: "POST", body });
}

export function getRolePermissions(roleId: string) {
  return apiRequest<Permission[]>(`/security/roles/${roleId}/permissions`);
}

export function grantPermissionToRole(roleId: string, permissionId: string) {
  return apiRequest<Permission[]>(`/security/roles/${roleId}/permissions`, {
    method: "POST",
    body: { permission_id: permissionId },
  });
}

export function revokePermissionFromRole(roleId: string, permissionId: string) {
  return apiRequest<void>(`/security/roles/${roleId}/permissions/${permissionId}`, {
    method: "DELETE",
  });
}

// --- Permissions catalog ---

export function listPermissions(module?: string) {
  return apiRequest<Permission[]>("/security/permissions", { query: { module } });
}

export function listPermissionModules() {
  return apiRequest<string[]>("/security/permissions/modules");
}

export function registerPermission(body: PermissionCreateRequest) {
  return apiRequest<Permission>("/security/permissions", { method: "POST", body });
}

// --- User <-> role assignment ---

export function listRolesForUser(userId: string) {
  return apiRequest<Role[]>(`/security/users/${userId}/roles`);
}

export function assignRoleToUser(userId: string, roleId: string) {
  return apiRequest<Role[]>(`/security/users/${userId}/roles`, {
    method: "POST",
    body: { role_id: roleId },
  });
}

export function removeRoleFromUser(userId: string, roleId: string) {
  return apiRequest<void>(`/security/users/${userId}/roles/${roleId}`, { method: "DELETE" });
}

// --- Audit logs ---

export function listAuditLogs(
  userId: string | undefined,
  method: string | undefined,
  pathContains: string | undefined,
  page: number,
  pageSize = 20,
) {
  return apiRequest<PaginatedAuditLogs>("/security/audit-logs", {
    query: { user_id: userId, method, path_contains: pathContains, page, page_size: pageSize },
  });
}

// --- Backups ---

export function listBackups(page: number, pageSize = 20) {
  return apiRequest<PaginatedBackups>("/security/backups", { query: { page, page_size: pageSize } });
}

export function getBackup(id: string) {
  return apiRequest<Backup>(`/security/backups/${id}`);
}

export function createBackup() {
  return apiRequest<Backup>("/security/backups", { method: "POST" });
}

export function downloadBackup(id: string, fileName: string) {
  return downloadFile(`/security/backups/${id}/download`, fileName);
}

export function restoreBackup(id: string, body: RestoreRequest) {
  return apiRequest<RestoreResult>(`/security/backups/${id}/restore`, { method: "POST", body });
}

export function restoreFromUploadedFile(file: File, targetDbname?: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("confirm", "true");
  if (targetDbname) formData.append("target_dbname", targetDbname);
  return uploadFormData<{ restored_into: string; restored_in_place: boolean }>(
    "/security/backups/restore-upload",
    formData,
  );
}
