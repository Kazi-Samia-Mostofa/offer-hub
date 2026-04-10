export type SellerProfileFields = {
  store_name?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  website_url?: string | null;
  logo_url?: string | null;
};

/** Store is “ready” for the main dashboard once required fields are saved. */
export function isSellerStoreReady(row: SellerProfileFields | null | undefined): boolean {
  if (!row) return false;
  const required = [row.store_name, row.description, row.email, row.phone, row.location];
  return required.every((v) => typeof v === "string" && v.trim().length > 0);
}
