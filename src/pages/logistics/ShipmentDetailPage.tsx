import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getShipment, updateShipmentStatus } from "../../api/logistics";
import type { Shipment, ShipmentStatusUpdateRequest } from "../../types/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { formatMoney } from "../../lib/format";
import { RecordPodModal } from "./RecordPodModal";
import { useAuth } from "../../auth/AuthContext";

const STATUS_TONE: Record<string, string> = {
  created: "bg-navy-100 text-ink-muted",
  picked_up: "bg-amber-100 text-amber-600",
  in_transit: "bg-amber-100 text-amber-600",
  out_for_delivery: "bg-amber-100 text-amber-600",
  delivered: "bg-positive-bg text-positive",
  exception: "bg-negative-bg text-negative",
  cancelled: "bg-navy-100 text-ink-muted",
};

const STATUS_OPTIONS: ShipmentStatusUpdateRequest["status"][] = [
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "exception",
  "cancelled",
];

export function ShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("logistics:create");

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPod, setShowPod] = useState(false);
  const [newStatus, setNewStatus] = useState<ShipmentStatusUpdateRequest["status"]>("in_transit");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  function load() {
    if (!id) return;
    getShipment(id)
      .then(setShipment)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load this shipment."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusUpdate() {
    if (!id) return;
    setBusy(true);
    setActionError(null);
    try {
      await updateShipmentStatus(id, { status: newStatus, location: location || undefined, notes: notes || undefined });
      setLocation("");
      setNotes("");
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Couldn't update the status.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>;
  if (error) return <p className="text-sm text-negative">{error}</p>;
  if (!shipment || !id) return null;

  const isFinal = shipment.status === "delivered" || shipment.status === "cancelled";

  return (
    <div>
      <Link to="/logistics/shipments" className="text-sm text-navy-800 hover:underline">
        ← Shipments
      </Link>

      <div className="mt-3 mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink font-mono-data">
            {shipment.tracking_number}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            {shipment.origin_address} → {shipment.destination_address}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
            STATUS_TONE[shipment.status] ?? "bg-navy-100 text-ink-muted"
          }`}
        >
          {shipment.status.replace("_", " ")}
        </span>
      </div>

      {actionError && <p className="mb-4 text-sm text-negative">{actionError}</p>}

      {canUpdate && !isFinal && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 items-end">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ShipmentStatusUpdateRequest["status"])}
              className="rounded-md border border-border bg-white px-3 py-2 text-sm capitalize"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex gap-2">
              <Button disabled={busy} onClick={handleStatusUpdate}>
                Update status
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => setShowPod(true)}>
                Mark delivered
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Total charge</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {formatMoney(shipment.total_charge)}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Weight</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {shipment.weight_kg ? `${shipment.weight_kg} kg` : "—"}
          </div>
        </Card>
        <Card className="p-5">
          <span className="text-sm text-ink-muted">Distance</span>
          <div className="mt-1 font-display text-lg font-semibold">
            {shipment.distance_km ? `${shipment.distance_km} km` : "—"}
          </div>
        </Card>
      </div>

      {shipment.proof_of_delivery && (
        <Card className="p-5 mb-6">
          <h2 className="text-sm font-medium text-ink-muted mb-2">Proof of delivery</h2>
          <p className="text-sm">
            Delivered to <span className="font-medium">{shipment.proof_of_delivery.recipient_name}</span>{" "}
            at {new Date(shipment.proof_of_delivery.delivered_at).toLocaleString("en-GB")}
          </p>
          {shipment.proof_of_delivery.notes && (
            <p className="text-sm text-ink-muted mt-1">{shipment.proof_of_delivery.notes}</p>
          )}
        </Card>
      )}

      <Card>
        <h2 className="px-5 pt-5 text-sm font-medium text-ink-muted mb-3">Tracking history</h2>
        {shipment.tracking_events.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">No tracking events yet.</p>
        ) : (
          <ul className="px-5 pb-5 flex flex-col gap-3">
            {shipment.tracking_events
              .slice()
              .reverse()
              .map((e) => (
                <li key={e.id} className="border-l-2 border-border pl-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{e.event_type.replace("_", " ")}</span>
                    {e.location && <span className="text-xs text-ink-muted">· {e.location}</span>}
                  </div>
                  {e.notes && <p className="text-xs text-ink-muted mt-0.5">{e.notes}</p>}
                  <span className="text-xs text-ink-muted/70">
                    {new Date(e.occurred_at).toLocaleString("en-GB")}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </Card>

      {showPod && (
        <RecordPodModal
          shipmentId={id}
          onClose={() => setShowPod(false)}
          onRecorded={() => {
            setShowPod(false);
            load();
          }}
        />
      )}
    </div>
  );
}
