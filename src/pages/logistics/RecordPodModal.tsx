import { useState, type FormEvent } from "react";
import { recordProofOfDelivery } from "../../api/logistics";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function RecordPodModal({
  shipmentId,
  onClose,
  onRecorded,
}: {
  shipmentId: string;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await recordProofOfDelivery(shipmentId, { recipient_name: recipientName, notes: notes || undefined });
      onRecorded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't record proof of delivery.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">Record proof of delivery</h2>
        <p className="mb-3 text-xs text-ink-muted">
          Signature and photo capture aren't wired to file storage in this frontend yet — only the
          recipient name and notes are recorded here.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Recipient name">
            <Input required value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
          </Field>
          <Field label="Notes">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Recording…" : "Record delivery"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
