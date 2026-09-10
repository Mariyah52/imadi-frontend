# IMADI Logistics ERP — Frontend

React 19 + TypeScript + Tailwind v4 (Vite), wired to the real `imadi-customERP`
FastAPI backend. First slice: Login → Dashboard → Customers, end to end
against real endpoints (no mock data).

## What's included

- **Auth**: `/auth/login` (with 2FA branch), silent session restore on load
  via the HttpOnly refresh cookie + `/auth/refresh`, CSRF double-submit
  handling (`csrf_token` cookie ↔ `X-CSRF-Token` header), auto-retry on 401.
  Access token lives in memory only — never localStorage.
- **Dashboard**: KPI cards composed from `/reports/profit`, `/reports/sales`,
  `/reports/customer-aging` (month-to-date). There's no dedicated
  `/dashboard` endpoint on the backend yet — swap these three calls for one
  if that gets added later (see `src/api/reports.ts`).
- **Customers**: paginated/searchable list (`GET /customers`), create modal
  (`POST /customers`), edit modal (`PATCH /customers/{id}`), detail page with
  balance/credit/invoices (`GET /customers/{id}`, `.../invoices`), plus
  contacts, addresses, and notes — each with its own add/list/remove panel
  wired to the matching sub-resource endpoints
  (`.../contacts`, `.../addresses`, `.../notes`).
- **Suppliers**: same pattern as Customers (list/create/edit/detail), minus
  contacts/addresses since the backend doesn't have those for suppliers.
  Detail page shows outstanding balance, bank details, purchase history
  (`.../purchase-history`), bills (`.../bills`), and notes. The notes panel
  is shared code (`src/components/shared/NotesPanel.tsx`) — both modules
  pass in their own load/create functions rather than duplicating the UI.
- **Inventory**: product list (search + a low-stock toggle sourced from
  `/inventory/products/low-stock`), create-product modal, detail page
  showing on-hand stock by batch (`.../stock`) and full movement history
  (`.../history`). Stock actions — receive, issue, adjust — are wired to
  `/inventory/stock/{receive,issue,adjust}` via one shared modal. Transfer
  and warehouse/category management screens aren't built yet (see gaps).
- **Invoicing**: list with status-filter chips, a full create page (customer
  type-ahead, dynamic line items, client-side subtotal estimate — actual
  VAT/totals are always backend-computed on submit), and a detail page with
  the real status lifecycle wired up: Post (`.../post`), Cancel
  (`.../cancel`, reason required), Duplicate (`.../duplicate`), and Record
  payment (`.../payments`). Status colors reflect `effective_status`
  (includes the derived "overdue" state), not just the stored `status`.
- **Purchasing**: Purchase orders (create → submit → approve/reject →
  receive goods, with a per-line quantity-received modal that respects
  `quantity_outstanding`) and Bills (create → submit → approve/reject →
  record payment) — both status-filtered lists, both wired to real
  `/purchasing/*` endpoints. Purchase Returns are not built (see gaps).
- **VAT**: period-based summary (sales/purchases broken out by VAT
  treatment, `/vat/summary`), a VAT number validator, and VAT returns
  (create → recompute → submit) showing all 9 real MTD boxes. The submit
  action is labeled honestly in the UI — it locks the return's figures but
  does not call the real HMRC Making Tax Digital API, matching what the
  backend actually does.
- **Reports**: the remaining 10 report types beyond the 3 the dashboard
  already uses — customer/supplier aging, inventory, stock valuation,
  trial balance, balance sheet, cash flow, general ledger, driver
  performance, vehicle cost. General ledger and cash flow now use a real
  account picker (dropdown / checkboxes off the chart of accounts) rather
  than manual UUID entry, now that Accounting exists to supply it.
- **Accounting**: chart of accounts (list, filter by type, create) and
  manual journal entries (create with a live client-side debit=credit
  balance check before the submit button unlocks, list with status
  filtering, detail with post/delete-draft/void). Voiding creates and
  navigates to the real reversing entry the backend generates, rather than
  just changing a status locally. Opening balances, financial year close,
  and recurring journal templates are not built (see gaps) — the backend
  has all three.
- **Banking**: bank/cash accounts (list, create, balance + unreconciled
  count), manual transactions, inter-account transfers, and the full
  statement-reconciliation workflow — CSV statement import, auto-match,
  per-line manual match against an unreconciled transaction, create-and-
  match for lines with no system record (bank fees, interest), ignore, and
  starting/completing a reconciliation with a live balance-difference
  check. This was the most workflow-heavy module so far — matching is a
  real multi-step process, not a form.
- **Logistics**: drivers (roster, licence tracking, status changes,
  licence-expiring-soon warning), vehicles (fleet list, maintenance
  records, fuel logs, service-due warning), and shipments (create with
  driver/vehicle assignment, status lifecycle, tracking-event timeline,
  proof of delivery). Pickup orders, delivery orders, and route planning
  (with stops) are not built — see gaps. The Record Delivery form is
  explicit that signature/photo capture isn't wired to file storage here,
  only recipient name and notes.
- **AI**: search, business insights, cash-flow forecast (weekly
  projection, labeled as a planning signal not booked cash), duplicate
  bill/invoice detection, an expense categorizer, a financial assistant
  Q&A page, and OCR document scanning (upload → extracted-data view). All
  of these call the backend's real AI service — nothing here is computed
  client-side or faked. OCR upload uses a small dedicated multipart
  request function since the shared API client is JSON-only.
- **Security/Admin**: roles and permissions (create a role, grant/revoke
  permissions from the real catalog), user-role assignment, audit logs
  (filterable by user/method/path), and database backups (create, list,
  restore). The restore flow mirrors the backend's own safety design
  exactly — leave the target database blank for a safe scratch-database
  restore, or fill it in for an in-place restore, which the UI calls out
  as destructive and irreversible before the confirm checkbox unlocks the
  button. User-role lookup takes a user ID as manual input since there's
  no user directory endpoint anywhere in this backend to build a picker
  from — said plainly in the page copy.

## Design system

Navy/amber "logistics" identity, carried forward for visual consistency
across the product:
- Space Grotesk (display), Inter (body), IBM Plex Mono (all numeric data and
  the `FIN-01`/`OPS-01`-style codes, which encode real report groupings).
- Tokens live in `src/index.css` under `@theme` — Tailwind v4's CSS-based
  config, no `tailwind.config.js`.

## Setup

```bash
npm install
npm run dev          # http://localhost:5173, proxies /api to :8000
```

Run the backend separately on port 8000 (`uvicorn app.main:app --reload`)
— `vite.config.ts` proxies `/api/*` to it so there's no CORS to configure
in dev.

```bash
npm run build         # tsc -b && vite build
npm run preview        # serve the production build locally
```

## Known gaps / next steps

- Attachment upload isn't wired (backend expects a pre-signed storage URL
  flow — `POST /customers/{id}/attachments` records metadata only, it
  doesn't accept file bytes, so this needs an object-storage decision first).
- No refresh-token rotation UI (session list exists on the backend
  `/auth/sessions` — not surfaced yet).
- No route-level permission gating beyond hiding edit/create controls; a
  user without the right permission would currently just see a 403 from the
  API rather than a friendly redirect.
- Supplier payments and statement endpoints exist on the backend
  (`.../payments`, `.../statement`) but aren't surfaced in the UI yet —
  same gap as Customer statements, which also aren't wired in.
- No stock transfer UI (`/inventory/stock/transfer` exists on the backend —
  receive/issue/adjust are wired, transfer isn't).
- No warehouse or category management screens — both are read via dropdowns
  (in the create-product and stock-action modals) but there's no page to
  create/edit them; `POST /inventory/categories` and
  `POST /inventory/warehouses` exist but aren't called from the UI.
- No QR code display (`.../qr-code` returns a base64 PNG, not shown yet).
- No invoice editing after creation (`PATCH /invoices/{id}` exists,
  draft-only — the UI only supports create, not edit-in-place).
- No PDF/email actions wired (`.../pdf`, `.../email` exist on the backend).
- No line-item product picker — line items are free-text description +
  price rather than selecting from the product catalog, so `product_id`
  is never sent on create even though the backend accepts it.
- Purchase Returns aren't built (`/purchasing/returns` — create, approve,
  complete — exists on the backend, mirrors the bill/PO shape).
- Purchasing attachments aren't wired (same pre-signed-URL pattern as
  customer/supplier/invoice attachments).
- PO/Bill line items don't link to a specific product either, same gap as
  Invoicing.

## Remaining backend modules (not yet built)

All eight modules from the original scope survey are now covered at
least partially. What's left is narrower gaps within modules, all noted
above as they came up: opening balances / financial year close /
recurring journal templates (Accounting); pickup orders, delivery
orders, and route planning with stops (Logistics); Purchase Returns
(Purchasing); attachments across Customers/Suppliers/Invoices/Purchasing;
customer/supplier statements; PDF/email actions on invoices; a
product-linked line-item picker on Invoicing and Purchasing. None of
these are large on their own — see each module's paragraph above for
specifics.
- Backend CORS: fine in dev via the Vite proxy. For a real staging deploy,
  the backend will need `CORSMiddleware` configured for the frontend's
  origin (or keep serving both behind the same reverse proxy).
