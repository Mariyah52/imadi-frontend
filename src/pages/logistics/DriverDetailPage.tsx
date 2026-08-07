import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getDriver, getDriverDashboard, updateDriver } from "../../api/logistics";
import type { Driver, DriverDashboard, DriverStatus } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../auth/AuthContext";

const STATUSES: DriverStatus[] = ["active", "on_leave", "suspended", "terminated"];

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("logistics:manage");

  const [driver, setDriver] = useState<Driver | null>(null);
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  function load() {
    if (!id) return;
    Promise.all([getDriver(id), getDriverDashboard(id)])
      .then(([d, dash]) => {
        setDriver(d);
        setDashboard(dash);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this driver."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusChange(status: DriverStatus) {
    if (!id) return;
    setUpdating(true);
    try {
      await updateDriver(id, { status });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update status.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!driver) return null;

  return (
    <div>
      <Link to="/logistics/drivers" className="text-sm text-navy-800 hover:underline">
        ← Drivers
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            {driver.first_name} {driver.last_name}
          </h1>
          <p className="font-mono-data text-xs text-ink-muted mt-1">{driver.licence_number}</p>
        </div>
        {canManage ? (
          <select
            value={driver.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as DriverStatus)}
            className="rounded-md border border-border bg-white px-3 py-2 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        ) : (
          <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium capitalize text-ink-muted">
            {driver.status.replace("_", " ")}
          </span>
        )}
      </div>

      {dashboard?.licence_expiring_soon && (
        <p className="mb-4 text-sm text-negative">Licence expiring soon — {driver.licence_expiry}</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Shipments today</span>
          <div className="mt-1 font-display text-xl font-semibold">
            {dashboard?.shipments_today_count ?? "—"}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Routes today</span>
          <div className="mt-1 font-display text-xl font-semibold">
            {dashboard?.routes_today_count ?? "—"}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Phone</span>
          <div className="mt-1 font-display text-xl font-semibold">{driver.phone ?? "—"}</div>
        </Card>
      </div>
    </div>
  );
}
