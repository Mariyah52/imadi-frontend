import { useState, type FormEvent } from "react";
import { addFuelLog } from "../../api/logistics";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { todayISO } from "../../lib/format";

export function AddFuelLogModal({
  vehicleId,
  onClose,
  onAdded,
}: {
  vehicleId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [fuelDate, setFuelDate] = useState(todayISO());
  const [litres, setLitres] = useState("");
  const [cost, setCost] = useState("");
  const [odometerKm, setOdometerKm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await addFuelLog(vehicleId, { fuel_date: fuelDate, litres, cost, odometer_km: odometerKm });
      onAdded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add the fuel log.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Add fuel log</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Date">
            <Input type="date" required value={fuelDate} onChange={(e) => setFuelDate(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Litres">
              <Input
                type="number"
                min={0}
                step="0.01"
                required
                value={litres}
                onChange={(e) => setLitres(e.target.value)}
              />
            </Field>
            <Field label="Cost">
              <Input
                type="number"
                min={0}
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Odometer (km)">
            <Input
              type="number"
              min={0}
              required
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value)}
            />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add fuel log"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
