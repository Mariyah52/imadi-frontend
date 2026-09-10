import { useState, type FormEvent } from "react";
import { createRole } from "../../api/security";
import { ApiError } from "../../api/client";
import { Button } from "../../components/ui/Button";
import { Field, Input } from "../../components/ui/Field";
import { Card } from "../../components/ui/Card";

export function CreateRoleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createRole({ name, description: description || undefined });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the role.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 px-4">
      <Card className="w-full max-w-sm p-6">
        <h2 className="font-display text-lg font-semibold text-ink mb-4">New role</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create role"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
