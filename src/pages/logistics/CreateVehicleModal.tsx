import { useState, type FormEvent } from "react";
import { createVehicle } from "../../api/logistics";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function CreateVehicleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [registration, setRegistration] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [capacityKg, setCapacityKg] = useState("");
  const [odometer, setOdometer] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createVehicle({
        registration,
        make: make || undefined,
        model: model || undefined,
        capacity_kg: capacityKg || undefined,
        current_odometer_km: odometer,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the vehicle.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">New vehicle</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Registration">
            <Input required value={registration} onChange={(e) => setRegistration(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Make">
              <Input value={make} onChange={(e) => setMake(e.target.value)} />
            </Field>
            <Field label="Model">
              <Input value={model} onChange={(e) => setModel(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Capacity (kg)">
              <Input
                type="number"
                min={0}
                value={capacityKg}
                onChange={(e) => setCapacityKg(e.target.value)}
              />
            </Field>
            <Field label="Odometer (km)">
              <Input
                type="number"
                min={0}
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
              />
            </Field>
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create vehicle"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
