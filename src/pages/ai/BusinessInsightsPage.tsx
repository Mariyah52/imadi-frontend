import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/client";
import { getBusinessInsights } from "../../api/ai";
import type { BusinessInsight } from "../../types/api";
import { Card } from "../../components/ui/Card";

const SEVERITY_TONE: Record<string, string> = {
  info: "bg-navy-100 text-ink-muted",
  warning: "bg-amber-100 text-amber-600",
  critical: "bg-negative-bg text-negative",
};

export function BusinessInsightsPage() {
  const [insights, setInsights] = useState<BusinessInsight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBusinessInsights()
      .then((res) => setInsights(res.insights))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load insights."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Link to="/ai" className="text-sm text-navy-800 hover:underline">
        ← AI tools
      </Link>
      <h1 className="font-display text-xl font-semibold text-ink mt-3 mb-6">Business insights</h1>

      {loading && <p className="text-sm text-ink-muted">Loading…</p>}
      {error && <p className="text-sm text-negative">{error}</p>}

      {!loading && !error && insights && (
        <Card>
          {insights.length === 0 ? (
            <p className="p-6 text-sm text-ink-muted">No insights right now.</p>
          ) : (
            <ul>
              {insights.map((ins, i) => (
                <li key={i} className="px-5 py-4 border-b border-border last:border-0 flex items-start gap-3">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      SEVERITY_TONE[ins.severity] ?? "bg-navy-100 text-ink-muted"
                    }`}
                  >
                    {ins.severity}
                  </span>
                  <div>
                    <div className="text-xs text-ink-muted capitalize mb-0.5">{ins.type.replace("_", " ")}</div>
                    <p className="text-sm text-ink">{ins.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
