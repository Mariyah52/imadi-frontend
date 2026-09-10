import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { assignRoleToUser, listRoles, listRolesForUser, removeRoleFromUser } from "../../api/security";
import type { Role } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { useAuth } from "../../auth/AuthContext";

export function UserRolesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("security:manage_roles");

  const [userId, setUserId] = useState("");
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Role[] | null>(null);
  const [assignRoleId, setAssignRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listRoles()
      .then(setAllRoles)
      .catch(() => setAllRoles([]));
  }, []);

  async function handleLookup(e: FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const roles = await listRolesForUser(userId.trim());
      setUserRoles(roles);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't look up this user's roles.");
      setUserRoles(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!assignRoleId) return;
    setBusy(true);
    try {
      const roles = await assignRoleToUser(userId.trim(), assignRoleId);
      setUserRoles(roles);
      setAssignRoleId("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't assign this role.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(roleId: string) {
    setBusy(true);
    try {
      await removeRoleFromUser(userId.trim(), roleId);
      setUserRoles((prev) => prev?.filter((r) => r.id !== roleId) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove this role.");
    } finally {
      setBusy(false);
    }
  }

  const assignableOptions = allRoles.filter((r) => !userRoles?.some((ur) => ur.id === r.id));

  return (
    <div>
      <Link to="/security" className="text-sm text-navy-800 hover:underline">
        ← Admin
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-1">User roles</h1>
      <p className="text-sm text-ink-muted mb-6">
        There's no user directory built into this frontend yet, so look a user up by their ID —
        find it via the browser's network tab when they're logged in, or from an audit log entry.
      </p>

      <Card className="p-5 mb-6 max-w-lg">
        <form onSubmit={handleLookup} className="flex gap-2">
          <Input placeholder="User ID (UUID)" value={userId} onChange={(e) => setUserId(e.target.value)} />
          <Button type="submit" disabled={loading}>
            {loading ? "Looking up…" : "Look up"}
          </Button>
        </form>
      </Card>

      {error && <p className="mb-4 text-sm text-negative">{error}</p>}

      {userRoles && (
        <Card className="p-5 max-w-lg">
          <h2 className="text-sm font-medium text-ink-muted mb-3">Assigned roles</h2>

          {canManage && (
            <div className="mb-4 flex gap-2">
              <Field label="">
                <select
                  value={assignRoleId}
                  onChange={(e) => setAssignRoleId(e.target.value)}
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm"
                >
                  <option value="">Assign a role…</option>
                  {assignableOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Button disabled={busy || !assignRoleId} onClick={handleAssign}>
                Assign
              </Button>
            </div>
          )}

          <ul className="flex flex-col gap-1.5">
            {userRoles.length === 0 ? (
              <li className="text-sm text-ink-muted">No roles assigned.</li>
            ) : (
              userRoles.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between text-sm border-b border-border pb-1.5 last:border-0"
                >
                  <span>{r.name}</span>
                  {canManage && (
                    <button
                      onClick={() => handleRemove(r.id)}
                      disabled={busy}
                      className="text-xs text-negative hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
