import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";

export function AccountingIndexPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-1">Accounting</h1>
      <p className="text-sm text-ink-muted mb-6">
        Trial balance, balance sheet, and general ledger live under Reports. This page covers the
        chart of accounts and journal entries themselves.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link to="/accounting/accounts">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Chart of accounts</div>
            <div className="text-xs text-ink-muted mt-1">Create and browse accounts</div>
          </Card>
        </Link>
        <Link to="/accounting/journal-entries">
          <Card className="p-4 hover:bg-navy-50 transition-colors">
            <div className="font-medium text-ink">Journal entries</div>
            <div className="text-xs text-ink-muted mt-1">Manual entries — draft, post, void</div>
          </Card>
        </Link>
      </div>
      <p className="mt-6 text-xs text-ink-muted">
        Opening balances, financial year close, and recurring journal templates aren't built into
        this frontend yet — see the README.
      </p>
    </div>
  );
}
