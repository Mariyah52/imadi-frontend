import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createShipment } from "../../api/logistics";
import { listDrivers, listVehicles } from "../../api/logistics";
import { ApiError } from "../../api/client";
import type { Customer, Driver, Vehicle } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { CustomerPicker } from "../invoices/CustomerPicker";

export function CreateShipmentPage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listDrivers("active", 1, 100).then((res) => setDrivers(res.items)).catch(() => setDrivers([]));
    listVehicles("active", 1, 100).then((res) => setVehicles(res.items)).catch(() => setVehicles([]));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!customer) {
      setError("Choose a customer first.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const shipment = await createShipment({
        customer_id: customer.id,
        origin_address: origin,
        destination_address: destination,
        distance_km: distanceKm || undefined,
        weight_kg: weightKg || undefined,
        driver_id: driverId || undefined,
        vehicle_id: vehicleId || undefined,
      });
      navigate(`/logistics/shipments/${shipment.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the shipment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/logistics/shipments" className="text-sm text-navy-800 hover:underline">
        ← Shipments
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">New shipment</h1>

      <Card className="p-5 max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Customer">
            <CustomerPicker value={customer} onChange={setCustomer} />
          </Field>
          <Field label="Origin address">
            <Input required value={origin} onChange={(e) => setOrigin(e.target.value)} />
          </Field>
          <Field label="Destination address">
            <Input required value={destination} onChange={(e) => setDestination(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Distance (km)">
              <Input
                type="number"
                min={0}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
              />
            </Field>
            <Field label="Weight (kg)">
              <Input type="number" min={0} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Driver">
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.first_name} {d.last_name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Vehicle">
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create shipment"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
