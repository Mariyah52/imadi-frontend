import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import {
  getRolePermissions,
  grantPermissionToRole,
  listPermissions,
  listRoles,
  revokePermissionFromRole,
} from "../../api/security";
import type { Permission, Role } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { CreateRoleModal } from "./CreateRoleModal";
import { useAuth } from "../../auth/AuthContext";

export function RolesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("security:manage_roles");

  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [grantPermissionId, setGrantPermissionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);

  function loadRoles() {
    setLoading(true);
    Promise.all([listRoles(), listPermissions()])
      .then(([r, p]) => {
        setRoles(r);
        setAllPermissions(p);
        if (r.length > 0 && !selectedRole) setSelectedRole(r[0]);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load roles."))
      .finally(() => setLoading(false));
  }

  useEffect(loadRoles, []);

  useEffect(() => {
    if (!selectedRole) return;
    getRolePermissions(selectedRole.id)
      .then(setRolePermissions)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load permissions."));
  }, [selectedRole]);

  async function handleGrant() {
    if (!selectedRole || !grantPermissionId) return;
    setBusy(true);
    try {
      const perms = await grantPermissionToRole(selectedRole.id, grantPermissionId);
      setRolePermissions(perms);
      setGrantPermissionId("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't grant this permission.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke(permissionId: string) {
    if (!selectedRole) return;
    setBusy(true);
    try {
      await revokePermissionFromRole(selectedRole.id, permissionId);
      setRolePermissions((prev) => prev.filter((p) => p.id !== permissionId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't revoke this permission.");
    } finally {
      setBusy(false);
    }
  }

  const grantableOptions = allPermissions.filter(
    (p) => !rolePermissions.some((rp) => rp.id === p.id),
  );

  return (
    <div>
      <Link to="/security" className="text-sm text-navy-800 hover:underline">
        ← Admin
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Roles &amp; permissions</h1>
        {canManage && <Button onClick={() => setShowCreate(true)}>New role</Button>}
      </div>

      {error && <p className="mb-4 text-sm text-negative">{error}</p>}
      {loading && <p className="text-sm text-ink-muted">Loading…</p>}

      {!loading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Roles</h2>
            <ul className="pb-3">
              {roles.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => setSelectedRole(r)}
                    className={`w-full text-left px-5 py-2 text-sm hover:bg-navy-50 ${
                      selectedRole?.id === r.id ? "bg-navy-50 font-medium" : ""
                    }`}
                  >
                    {r.name}
                    {r.is_system && (
                      <span className="ml-2 rounded-full bg-navy-100 px-2 py-0.5 text-xs text-ink-muted">
                        system
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-2 p-5">
            {!selectedRole ? (
              <p className="text-sm text-ink-muted">Select a role.</p>
            ) : (
              <>
                <h2 className="text-sm font-medium text-ink-muted mb-1">{selectedRole.name}</h2>
                {selectedRole.description && (
                  <p className="text-xs text-ink-muted mb-3">{selectedRole.description}</p>
                )}

                {canManage && (
                  <div className="mb-4 flex gap-2">
                    <select
                      value={grantPermissionId}
                      onChange={(e) => setGrantPermissionId(e.target.value)}
                      className="flex-1 rounded-md border border-border bg-white px-3 py-2 text-sm"
                    >
                      <option value="">Grant a permission…</option>
                      {grantableOptions.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} ({p.module})
                        </option>
                      ))}
                    </select>
                    <Button disabled={busy || !grantPermissionId} onClick={handleGrant}>
                      Grant
                    </Button>
                  </div>
                )}

                <ul className="flex flex-col gap-1.5">
                  {rolePermissions.length === 0 ? (
                    <li className="text-sm text-ink-muted">No permissions granted.</li>
                  ) : (
                    rolePermissions.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between text-sm border-b border-border pb-1.5 last:border-0"
                      >
                        <div>
                          <span className="font-mono-data">{p.code}</span>
                          <span className="text-xs text-ink-muted ml-2">{p.module}</span>
                        </div>
                        {canManage && (
                          <button
                            onClick={() => handleRevoke(p.id)}
                            disabled={busy}
                            className="text-xs text-negative hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </Card>
        </div>
      )}

      {showCreate && (
        <CreateRoleModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadRoles();
          }}
        />
      )}
    </div>
  );
}
