import { useState, type FormEvent } from "react";
import { restoreBackup } from "../../api/security";
import { ApiError } from "../../api/client";
import type { RestoreResult } from "../../types/api";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function RestoreBackupModal({
  backupId,
  onClose,
  onDone,
}: {
  backupId: string;
  onClose: () => void;
  onDone: (result: RestoreResult) => void;
}) {
  const [targetDbname, setTargetDbname] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isDestructive = targetDbname.trim().length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!confirmed) {
      setError("Check the confirmation box to proceed.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await restoreBackup(backupId, {
        confirm: true,
        target_dbname: targetDbname.trim() || undefined,
      });
      onDone(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't restore this backup.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-md p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-2">Restore backup</h2>
        <p className="mb-4 text-sm text-ink-muted">
          Leave the target database blank to restore into a fresh scratch database — safe to
          inspect before trusting it. Only fill it in to restore in place, which overwrites all
          current data.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Target database (optional — leave blank for a safe scratch restore)">
            <Input value={targetDbname} onChange={(e) => setTargetDbname(e.target.value)} />
          </Field>
          {isDestructive && (
            <p className="text-sm text-negative font-medium">
              This will overwrite all data in "{targetDbname.trim()}". This cannot be undone.
            </p>
          )}
          <label className="flex items-start gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border"
            />
            I understand and want to proceed with this restore.
          </label>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !confirmed}>
              {submitting ? "Restoring…" : "Restore"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
