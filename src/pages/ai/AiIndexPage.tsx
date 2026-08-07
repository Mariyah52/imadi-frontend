import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

const ITEMS = [
  { to: "/ai/search", label: "Search", desc: "Find customers, invoices, and more by natural query" },
  { to: "/ai/insights", label: "Business insights", desc: "Automated observations about your finances" },
  { to: "/ai/cash-flow-forecast", label: "Cash flow forecast", desc: "Projected balance over the coming weeks" },
  { to: "/ai/duplicates", label: "Duplicate detection", desc: "Possible duplicate bills and invoices" },
  { to: "/ai/categorize-expense", label: "Expense categorizer", desc: "Suggest a category from a description" },
  { to: "/ai/assistant", label: "Financial assistant", desc: "Ask a question about your business data" },
  { to: "/ai/ocr", label: "Document scanning (OCR)", desc: "Upload invoices or receipts for extraction" },
];

export function AiIndexPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-1">AI tools</h1>
      <p className="text-sm text-ink-muted mb-6">
        These call the backend's real AI service — results reflect whatever heuristics or model it
        uses server-side, not anything computed in this frontend.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <Link key={item.to} to={item.to}>
            <Card className="p-4 hover:bg-navy-50 transition-colors">
              <div className="font-medium text-ink">{item.label}</div>
              <div className="text-xs text-ink-muted mt-1">{item.desc}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
