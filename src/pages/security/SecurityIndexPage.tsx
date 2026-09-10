import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function SecurityIndexPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-1">Admin</h1>
      <p className="text-sm text-ink-muted mb-6">Database backups.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
