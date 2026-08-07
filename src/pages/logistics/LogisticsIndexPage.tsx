import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function LogisticsIndexPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-1">Logistics</h1>
      <p className="text-sm text-ink-muted mb-6">
        Pickup orders, delivery orders, and route planning aren't built into this frontend yet —
        see the README. This covers drivers, vehicles, and shipment tracking.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link to="/logistics/shipments">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Shipments</div>
            <div className="text-xs text-ink-muted mt-1">Tracking, status, proof of delivery</div>
          </Card>
        </Link>
        <Link to="/logistics/drivers">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Drivers</div>
            <div className="text-xs text-ink-muted mt-1">Roster, licence, status</div>
          </Card>
        </Link>
        <Link to="/logistics/vehicles">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Vehicles</div>
            <div className="text-xs text-ink-muted mt-1">Fleet, maintenance, fuel</div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
