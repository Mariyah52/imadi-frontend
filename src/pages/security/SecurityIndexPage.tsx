import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function SecurityIndexPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-1">Admin</h1>
      <p className="text-sm text-ink-muted mb-6">
        Roles, permissions, audit trail, and database backups.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/security/roles">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Roles &amp; permissions</div>
            <div className="text-xs text-ink-muted mt-1">Create roles, grant/revoke permissions</div>
          </Card>
        </Link>
        <Link to="/security/user-roles">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">User roles</div>
            <div className="text-xs text-ink-muted mt-1">Assign or remove roles for a user</div>
          </Card>
        </Link>
        <Link to="/security/audit-logs">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Audit logs</div>
            <div className="text-xs text-ink-muted mt-1">Every request, filterable</div>
          </Card>
        </Link>
        <Link to="/security/backups">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Backups</div>
            <div className="text-xs text-ink-muted mt-1">Create and restore database backups</div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
