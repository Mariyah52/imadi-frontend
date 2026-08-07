import { apiRequest } from "./client";
import type {
  Category,
  LowStockProduct,
  PaginatedProducts,
  Product,
  ProductCreateRequest,
  ProductStockSummary,
  StockAdjustmentRequest,
  StockIssueRequest,
  StockItem,
  StockMovement,
  StockReceiptRequest,
  Warehouse,
} from "../types/api";

export function listCategories() {
  return apiRequest<Category[]>("/inventory/categories");
}

export function listWarehouses() {
  return apiRequest<Warehouse[]>("/inventory/warehouses");
}

export function listProducts(search: string, categoryId: string | undefined, page: number, pageSize = 20) {
  return apiRequest<PaginatedProducts>("/inventory/products", {
    query: { search: search || undefined, category_id: categoryId, page, page_size: pageSize },
  });
}

export function listLowStockProducts() {
  return apiRequest<LowStockProduct[]>("/inventory/products/low-stock");
}

export function getProduct(id: string) {
  return apiRequest<ProductStockSummary>(`/inventory/products/${id}`);
}

export function createProduct(body: ProductCreateRequest) {
  return apiRequest<Product>("/inventory/products", { method: "POST", body });
}

export function listStockForProduct(id: string) {
  return apiRequest<StockItem[]>(`/inventory/products/${id}/stock`);
}

export function getProductHistory(id: string, limit = 200) {
  return apiRequest<StockMovement[]>(`/inventory/products/${id}/history`, { query: { limit } });
}

export function receiveStock(body: StockReceiptRequest) {
  return apiRequest<StockMovement>("/inventory/stock/receive", { method: "POST", body });
}

export function issueStock(body: StockIssueRequest) {
  return apiRequest<StockMovement>("/inventory/stock/issue", { method: "POST", body });
}

export function adjustStock(body: StockAdjustmentRequest) {
  return apiRequest<StockMovement>("/inventory/stock/adjust", { method: "POST", body });
}
