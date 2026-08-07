import { apiRequest } from "./client";
import type {
  Address,
  AddressCreateRequest,
  Contact,
  ContactCreateRequest,
  Customer,
  CustomerCreateRequest,
  CustomerInvoice,
  CustomerProfile,
  CustomerUpdateRequest,
  Note,
  PaginatedCustomers,
} from "../types/api";

export function listCustomers(search: string, page: number, pageSize = 20) {
  return apiRequest<PaginatedCustomers>("/customers", {
    query: { search: search || undefined, page, page_size: pageSize },
  });
}

export function getCustomerProfile(id: string) {
  return apiRequest<CustomerProfile>(`/customers/${id}`);
}

export function createCustomer(body: CustomerCreateRequest) {
  return apiRequest<Customer>("/customers", { method: "POST", body });
}

export function updateCustomer(id: string, body: CustomerUpdateRequest) {
  return apiRequest<Customer>(`/customers/${id}`, { method: "PATCH", body });
}

export function listCustomerInvoices(id: string) {
  return apiRequest<CustomerInvoice[]>(`/customers/${id}/invoices`);
}

// --- Contacts ---

export function listContacts(customerId: string) {
  return apiRequest<Contact[]>(`/customers/${customerId}/contacts`);
}

export function addContact(customerId: string, body: ContactCreateRequest) {
  return apiRequest<Contact>(`/customers/${customerId}/contacts`, { method: "POST", body });
}

export function removeContact(customerId: string, contactId: string) {
  return apiRequest<void>(`/customers/${customerId}/contacts/${contactId}`, { method: "DELETE" });
}

// --- Addresses ---

export function listAddresses(customerId: string) {
  return apiRequest<Address[]>(`/customers/${customerId}/addresses`);
}

export function addAddress(customerId: string, body: AddressCreateRequest) {
  return apiRequest<Address>(`/customers/${customerId}/addresses`, { method: "POST", body });
}

export function removeAddress(customerId: string, addressId: string) {
  return apiRequest<void>(`/customers/${customerId}/addresses/${addressId}`, {
    method: "DELETE",
  });
}

// --- Notes ---

export function listNotes(customerId: string) {
  return apiRequest<Note[]>(`/customers/${customerId}/notes`);
}

export function addNote(customerId: string, body: string) {
  return apiRequest<Note>(`/customers/${customerId}/notes`, { method: "POST", body: { body } });
}
