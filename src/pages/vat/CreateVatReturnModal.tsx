import { useState, type FormEvent } from "react";
import { createVatReturn } from "../../api/vat";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";
import { currentQuarter } from "../../lib/format";

export function CreateVatReturnModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const q = currentQuarter();
  const [periodStart, setPeriodStart] = useState(q.start);
  const [periodEnd, setPeriodEnd] = useState(q.end);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const vatReturn = await createVatReturn({ period_start: periodStart, period_end: periodEnd });
      onCreated(vatReturn.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the VAT return.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">New VAT return</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Period start">
            <Input type="date" required value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </Field>
          <Field label="Period end">
            <Input type="date" required value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create draft"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
