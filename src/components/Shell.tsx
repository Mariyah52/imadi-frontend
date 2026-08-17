import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./ui/Button";
import { LOGO_DATA_URI } from "../assets/logo";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/customers", label: "Customers", end: false },
  { to: "/inventory", label: "Inventory", end: false },
  { to: "/invoices", label: "Invoices", end: false },
  { to: "/purchasing/orders", label: "Purchase orders", end: false },
  { to: "/purchasing/bills", label: "Bills", end: false },
  { to: "/vat", label: "VAT", end: false },
  { to: "/reports", label: "Reports", end: false },
  { to: "/accounting", label: "Accounting", end: false },
  { to: "/banking", label: "Banking", end: false },
  { to: "/logistics", label: "Logistics", end: false },
  { to: "/ai", label: "AI tools", end: false },
  { to: "/security", label: "Admin", end: false },
];

export function Shell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-bg">
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 w-60 border-r border-border bg-navy-900 text-white no-print">
          <div className="flex h-16 items-center gap-2 px-6 bg-white">
            <img src={LOGO_DATA_URI} alt="IMADI Fulfilment & Logistics" className="h-9" />
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-navy-800 text-amber-400"
                      : "text-navy-100 hover:bg-navy-800/60"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="ml-60 flex-1 print:ml-0">
          <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-8 no-print">
            <div className="font-mono-data text-xs text-ink-muted">
              IMADI Fulfilment and Logistics Ltd
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium leading-tight">{user?.full_name}</div>
                <div className="text-xs text-ink-muted leading-tight">{user?.email}</div>
              </div>
              <Button variant="secondary" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          </header>
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
