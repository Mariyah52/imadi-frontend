import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import {
  getVehicle,
  getVehicleDashboard,
  listFuelLogs,
  listMaintenanceRecords,
} from "../../api/logistics";
import type { FuelLog, MaintenanceRecord, Vehicle, VehicleDashboard } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { formatMoney } from "../../lib/format";
import { AddMaintenanceModal } from "./AddMaintenanceModal";
import { AddFuelLogModal } from "./AddFuelLogModal";
import { useAuth } from "../../auth/AuthContext";

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("logistics:manage");

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [dashboard, setDashboard] = useState<VehicleDashboard | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showFuel, setShowFuel] = useState(false);

  function load() {
    if (!id) return;
    Promise.all([getVehicle(id), getVehicleDashboard(id), listMaintenanceRecords(id), listFuelLogs(id)])
      .then(([v, dash, maint, fuel]) => {
        setVehicle(v);
        setDashboard(dash);
        setMaintenance(maint);
        setFuelLogs(fuel);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this vehicle."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!vehicle || !id) return null;

  return (
    <div>
      <Link to="/logistics/vehicles" className="text-sm text-navy-800 hover:underline">
        ← Vehicles
      </Link>

      <div className="mt-3 mb-6">
        <h1 className="font-display text-xl font-semibold text-ink font-mono-data">
          {vehicle.registration}
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—"} ·{" "}
          {vehicle.current_odometer_km} km
        </p>
      </div>

      {dashboard?.service_due_soon && (
        <p className="mb-4 text-sm text-negative">
          Service due soon
          {vehicle.next_service_due_date && ` — ${vehicle.next_service_due_date}`}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Active shipments</span>
          <div className="mt-1 font-display text-xl font-semibold">
            {dashboard?.active_shipment_count ?? "—"}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Status</span>
          <div className="mt-1 font-display text-xl font-semibold capitalize">{vehicle.status}</div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Capacity</span>
          <div className="mt-1 font-display text-xl font-semibold">
            {vehicle.capacity_kg ? `${vehicle.capacity_kg} kg` : "—"}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <div className="flex items-center justify-between px-5 pt-5 mb-3">
            <h2 className="text-sm font-medium text-ink-muted">Maintenance</h2>
            {canManage && (
              <Button variant="ghost" onClick={() => setShowMaintenance(true)}>
                Add record
              </Button>
            )}
          </div>
          {maintenance.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-ink-muted">No maintenance records yet.</p>
          ) : (
            <ul className="px-5 pb-5 flex flex-col gap-2">
              {maintenance.map((m) => (
                <li key={m.id} className="text-sm border-b border-border pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span className="capitalize font-medium">{m.maintenance_type}</span>
                    <span className="font-mono-data">{formatMoney(m.cost)}</span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {m.service_date} · {m.description}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between px-5 pt-5 mb-3">
            <h2 className="text-sm font-medium text-ink-muted">Fuel logs</h2>
            {canManage && (
              <Button variant="ghost" onClick={() => setShowFuel(true)}>
                Add log
              </Button>
            )}
          </div>
          {fuelLogs.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-ink-muted">No fuel logs yet.</p>
          ) : (
            <ul className="px-5 pb-5 flex flex-col gap-2">
              {fuelLogs.map((f) => (
                <li key={f.id} className="text-sm border-b border-border pb-2 last:border-0">
                  <div className="flex justify-between">
                    <span>{f.litres} L</span>
                    <span className="font-mono-data">{formatMoney(f.cost)}</span>
                  </div>
                  <div className="text-xs text-ink-muted">
                    {f.fuel_date} · {f.odometer_km} km
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {showMaintenance && (
        <AddMaintenanceModal
          vehicleId={id}
          onClose={() => setShowMaintenance(false)}
          onAdded={() => {
            setShowMaintenance(false);
            load();
          }}
        />
      )}
      {showFuel && (
        <AddFuelLogModal
          vehicleId={id}
          onClose={() => setShowFuel(false)}
          onAdded={() => {
            setShowFuel(false);
            load();
          }}
        />
      )}
    </div>
  );
}
