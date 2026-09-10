import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { listVehicles } from "../../api/logistics";
import type { Vehicle } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { CreateVehicleModal } from "./CreateVehicleModal";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  active: "bg-positive-bg text-positive",
  maintenance: "bg-amber-100 text-amber-600",
  retired: "bg-navy-100 text-ink-muted",
};

export function VehiclesListPage() {
  const { hasPermission } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function load() {
    setLoading(true);
    listVehicles(undefined, 1, 100)
      .then((res) => setVehicles(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load vehicles."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Vehicles</h1>
        {hasPermission("logistics:manage") && (
          <Button onClick={() => setShowCreate(true)}>New vehicle</Button>
        )}
      </div>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <Link key={v.id} to={`/logistics/vehicles/${v.id}`}>
              <Card className="p-5 hover:bg-navy-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-mono-data font-medium text-ink">{v.registration}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      STATUS_TONE[v.status] ?? "bg-navy-100 text-ink-muted"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                <div className="text-xs text-ink-muted mt-1">
                  {[v.make, v.model].filter(Boolean).join(" ") || "—"}
                </div>
                <div className="mt-3 font-mono-data text-xs text-ink-muted">
                  {v.current_odometer_km} km
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <CreateVehicleModal
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
