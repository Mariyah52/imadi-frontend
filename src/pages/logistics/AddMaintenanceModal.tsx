import { useState, type FormEvent } from "react";
import { addMaintenanceRecord } from "../../api/logistics";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { todayISO } from "../../lib/format";

const TYPES = ["service", "repair", "inspection", "tyres", "other"] as const;

export function AddMaintenanceModal({
  vehicleId,
  onClose,
  onAdded,
}: {
  vehicleId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [maintenanceType, setMaintenanceType] = useState<(typeof TYPES)[number]>("service");
  const [description, setDescription] = useState("");
  const [serviceDate, setServiceDate] = useState(todayISO());
  const [odometerKm, setOdometerKm] = useState("");
  const [cost, setCost] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await addMaintenanceRecord(vehicleId, {
        maintenance_type: maintenanceType,
        description,
        service_date: serviceDate,
        odometer_km: odometerKm,
        cost,
      });
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add the record.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Add maintenance record</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Type">
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value as (typeof TYPES)[number])}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm capitalize"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description">
            <Input required value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Service date">
              <Input type="date" required value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
            </Field>
            <Field label="Odometer (km)">
              <Input
                type="number"
                min={0}
                required
                value={odometerKm}
                onChange={(e) => setOdometerKm(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Cost">
            <Input type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add record"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
