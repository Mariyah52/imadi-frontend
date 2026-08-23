import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/purchasing/orders", label: "Purchase Orders" },
  { to: "/purchasing/bills", label: "Bills" },
];

export function PurchasingTabs() {
  return (
    <div className="mb-4 flex gap-2">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? "bg-navy-800 text-white" : "bg-navy-100 text-ink-muted hover:bg-navy-100/70"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
