import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listDrivers } from "../../api/logistics";
import type { Driver } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CreateDriverModal } from "./CreateDriverModal";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  active: "bg-positive-bg text-positive",
  on_leave: "bg-amber-100 text-amber-600",
  suspended: "bg-negative-bg text-negative",
  terminated: "bg-navy-100 text-ink-muted",
};

export function DriversListPage() {
  const { hasPermission } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    listDrivers(undefined, 1, 100)
      .then((res) => setDrivers(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load drivers."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Drivers</h1>
        {hasPermission("logistics:manage") && (
          <Button onClick={() => setShowCreate(true)}>New driver</Button>
        )}
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Licence</th>
                <th className="px-5 py-3 font-medium">Expiry</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-navy-50">
                  <td className="px-5 py-3">
                    <Link to={`/logistics/drivers/${d.id}`} className="font-medium text-navy-800 hover:underline">
                      {d.first_name} {d.last_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono-data text-xs">{d.licence_number}</td>
                  <td className="px-5 py-3 text-ink-muted">{d.licence_expiry}</td>
                  <td className="px-5 py-3 text-ink-muted">{d.phone ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[d.status] ?? "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {d.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate && (
        <CreateDriverModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
    </div>
  );
}
