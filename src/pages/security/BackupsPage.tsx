import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { createBackup, downloadBackup, listBackups } from "../../api/security";
import type { Backup, RestoreResult } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { RestoreBackupModal } from "./RestoreBackupModal";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  completed: "bg-positive-bg text-positive",
  in_progress: "bg-amber-100 text-amber-600",
  failed: "bg-negative-bg text-negative",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BackupsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("security:manage_backups");

  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);
  const [lastRestore, setLastRestore] = useState<RestoreResult | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    listBackups(1, 50)
      .then((res) => setBackups(res.items))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load backups."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      await createBackup();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create a backup.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDownload(backup: Backup) {
    setDownloadingId(backup.id);
    setError(null);
    try {
      await downloadBackup(backup.id, backup.file_name);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't download this backup.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div>
      <Link to="/security" className="text-sm text-navy-800 hover:underline">
        ← Admin
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">Backups</h1>
        {canManage && (
          <Button disabled={creating} onClick={handleCreate}>
            {creating ? "Creating…" : "Create backup now"}
          </Button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-negative">{error}</p>}

      {lastRestore && (
        <Card className="p-4 mb-6 bg-positive-bg">
          <p className="text-sm text-positive">
            Restored into <span className="font-mono-data">{lastRestore.restored_into}</span>
            {lastRestore.restored_in_place ? " (in place)" : " (scratch database)"}.
          </p>
        </Card>
      )}

      <Card>
        {loading && <p className="p-6 text-sm text-ink-muted">Loading…</p>}
        {!loading && backups.length === 0 && (
          <p className="p-6 text-sm text-ink-muted">No backups yet.</p>
        )}
        {!loading && backups.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">File</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium text-right">Size</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono-data text-xs">{b.file_name}</td>
                  <td className="px-5 py-3 text-ink-muted">
                    {new Date(b.created_at).toLocaleString("en-GB")}
                  </td>
                  <td className="px-5 py-3 text-right font-mono-data">{formatBytes(b.size_bytes)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[b.status] ?? "bg-navy-100 text-ink-muted"
                      }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                    {b.error_message && (
                      <div className="text-xs text-negative mt-0.5">{b.error_message}</div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {b.status === "completed" && (
                        <button
                          onClick={() => handleDownload(b)}
                          disabled={downloadingId === b.id}
                          className="text-xs text-navy-800 hover:underline disabled:opacity-50"
                        >
                          {downloadingId === b.id ? "Downloading…" : "Download"}
                        </button>
                      )}
                      {canManage && b.status === "completed" && (
                        <button
                          onClick={() => setRestoreTarget(b.id)}
                          className="text-xs text-navy-800 hover:underline"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {restoreTarget && (
        <RestoreBackupModal
          backupId={restoreTarget}
          onClose={() => setRestoreTarget(null)}
          onDone={(result) => {
            setRestoreTarget(null);
            setLastRestore(result);
            load();
          }}
        />
      )}
    </div>
  );
}
