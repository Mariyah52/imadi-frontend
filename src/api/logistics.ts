import { apiRequest } from "./client";
import type {
  Driver,
  DriverCreateRequest,
  DriverDashboard,
  DriverUpdateRequest,
  FuelLog,
  FuelLogCreateRequest,
  MaintenanceRecord,
  MaintenanceRecordCreateRequest,
  PaginatedDrivers,
  PaginatedShipments,
  PaginatedVehicles,
  ProofOfDelivery,
  ProofOfDeliveryCreateRequest,
  Shipment,
  ShipmentCreateRequest,
  ShipmentStatusUpdateRequest,
  Vehicle,
  VehicleCreateRequest,
  VehicleDashboard,
} from "../types/api";

// --- Drivers ---

export function listDrivers(status: string | undefined, page: number, pageSize = 20) {
  return apiRequest<PaginatedDrivers>("/logistics/drivers", {
    query: { status, page, page_size: pageSize },
  });
}

export function getDriver(id: string) {
  return apiRequest<Driver>(`/logistics/drivers/${id}`);
}

export function createDriver(body: DriverCreateRequest) {
  return apiRequest<Driver>("/logistics/drivers", { method: "POST", body });
}

export function updateDriver(id: string, body: DriverUpdateRequest) {
  return apiRequest<Driver>(`/logistics/drivers/${id}`, { method: "PATCH", body });
}

export function getDriverDashboard(id: string) {
  return apiRequest<DriverDashboard>(`/logistics/drivers/${id}/dashboard`);
}

// --- Vehicles ---

export function listVehicles(status: string | undefined, page: number, pageSize = 20) {
  return apiRequest<PaginatedVehicles>("/logistics/vehicles", {
    query: { status, page, page_size: pageSize },
  });
}

export function getVehicle(id: string) {
  return apiRequest<Vehicle>(`/logistics/vehicles/${id}`);
}

export function createVehicle(body: VehicleCreateRequest) {
  return apiRequest<Vehicle>("/logistics/vehicles", { method: "POST", body });
}

export function getVehicleDashboard(id: string) {
  return apiRequest<VehicleDashboard>(`/logistics/vehicles/${id}/dashboard`);
}

export function listMaintenanceRecords(vehicleId: string) {
  return apiRequest<MaintenanceRecord[]>(`/logistics/vehicles/${vehicleId}/maintenance`);
}

export function addMaintenanceRecord(vehicleId: string, body: MaintenanceRecordCreateRequest) {
  return apiRequest<MaintenanceRecord>(`/logistics/vehicles/${vehicleId}/maintenance`, {
    method: "POST",
    body,
  });
}

export function listFuelLogs(vehicleId: string) {
  return apiRequest<FuelLog[]>(`/logistics/vehicles/${vehicleId}/fuel-logs`);
}

export function addFuelLog(vehicleId: string, body: FuelLogCreateRequest) {
  return apiRequest<FuelLog>(`/logistics/vehicles/${vehicleId}/fuel-logs`, { method: "POST", body });
}

// --- Shipments ---

export function listShipments(
  customerId: string | undefined,
  status: string | undefined,
  page: number,
  pageSize = 20,
) {
  return apiRequest<PaginatedShipments>("/logistics/shipments", {
    query: { customer_id: customerId, status, page, page_size: pageSize },
  });
}

export function getShipment(id: string) {
  return apiRequest<Shipment>(`/logistics/shipments/${id}`);
}

export function createShipment(body: ShipmentCreateRequest) {
  return apiRequest<Shipment>("/logistics/shipments", { method: "POST", body });
}

export function updateShipmentStatus(id: string, body: ShipmentStatusUpdateRequest) {
  return apiRequest<Shipment>(`/logistics/shipments/${id}/status`, { method: "POST", body });
}

export function recordProofOfDelivery(id: string, body: ProofOfDeliveryCreateRequest) {
  return apiRequest<ProofOfDelivery>(`/logistics/shipments/${id}/proof-of-delivery`, {
    method: "POST",
    body,
  });
}
