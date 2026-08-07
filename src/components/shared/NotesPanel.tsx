import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "../../api/client";
import type { Note } from "../../types/api";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";
import { useAuth } from "../../auth/AuthContext";

export function NotesPanel({
  entityId,
  loadNotes,
  createNote,
  canEditPermission,
}: {
  entityId: string;
  loadNotes: (id: string) => Promise<Note[]>;
  createNote: (id: string, body: string) => Promise<Note>;
  canEditPermission: string;
}) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission(canEditPermission);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    loadNotes(entityId)
      .then((ns) => setNotes(ns.slice().reverse()))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load notes."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [entityId]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await createNote(entityId, body.trim());
      setBody("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add note.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-5">
      <h2 className="mb-3 text-sm font-medium text-ink-muted">Notes</h2>

      {error && <p className="mb-2 text-sm text-negative">{error}</p>}

      {canEdit && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-2">
          <Textarea
            rows={3}
            placeholder="Add a note…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" disabled={submitting} className="self-start">
            {submitting ? "Adding…" : "Add note"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-ink-muted">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((n) => (
            <li key={n.id} className="border-l-2 border-border pl-3">
              <p className="text-sm text-ink whitespace-pre-wrap">{n.body}</p>
              <span className="text-xs text-ink-muted">
                {new Date(n.created_at).toLocaleString("en-GB")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
