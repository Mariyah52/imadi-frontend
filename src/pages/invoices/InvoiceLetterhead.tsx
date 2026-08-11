import type { Address } from "../../types/api";

// Single-tenant app — this ERP only ever serves one company, so these are
// fixed rather than pulled from a settings screen. Update here if any of
// these details change.
const COMPANY = {
  name: "IMADI FULFILMENT AND LOGISTICS LTD",
  addressLine: "195 North Road, Clayton, M11 4NF",
  email: "Imadilogistics@gmail.com",
  vatNumber: "489 7509 21",
};

const BANK_DETAILS = {
  accountTitle: "IMADI FULFILMENT AND LOGISTICS LTD",
  accountNumber: "10494761",
  sortCode: "23-01-20",
};

export function InvoiceLetterhead() {
  return (
    <div className="mb-6">
      <h2 className="font-display text-lg font-bold text-ink">{COMPANY.name}</h2>
      <p className="text-sm text-ink-muted">{COMPANY.addressLine}</p>
      <p className="text-sm text-ink-muted">{COMPANY.email}</p>
      <p className="text-sm text-ink-muted">VAT Registration No.: {COMPANY.vatNumber}</p>
    </div>
  );
}

export function InvoiceBillTo({
  customerName,
  address,
}: {
  customerName: string;
  address: Address | null;
}) {
  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wide text-ink-muted mb-1">
        Invoice to
      </h3>
      <p className="text-sm font-medium text-ink">{customerName}</p>
      {address && (
        <>
          <p className="text-sm text-ink-muted">{address.line1}</p>
          {address.line2 && <p className="text-sm text-ink-muted">{address.line2}</p>}
          <p className="text-sm text-ink-muted">
            {address.city}, {address.postcode}
          </p>
        </>
      )}
    </div>
  );
}

export function InvoicePaymentDetails({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <div className="text-center text-sm">
      <p className="font-medium text-ink mb-1">Payment by bank transfer</p>
      <p className="text-ink-muted">Account title: {BANK_DETAILS.accountTitle}</p>
      <p className="text-ink-muted">Bank account: {BANK_DETAILS.accountNumber}</p>
      <p className="text-ink-muted">Sort code: {BANK_DETAILS.sortCode}</p>
      <p className="text-ink-muted">Reference: {invoiceNumber}</p>
    </div>
  );
}
