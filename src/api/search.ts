import { apiRequest } from "./client";

export interface GlobalSearchItem {
  type: string;
  label: string;
  id: string;
  title: string | null;
  subtitle: string | null;
  resource_path: string;
  href: string;
}

interface GlobalSearchResponse {
  query: string;
  items: GlobalSearchItem[];
}

export async function globalSearch(query: string, signal?: AbortSignal): Promise<GlobalSearchItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return (await apiRequest<GlobalSearchResponse>("/search", {
    query: { q: trimmed, limit: 15 },
    signal,
  })).items;
}
