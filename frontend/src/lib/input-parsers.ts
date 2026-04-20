import { type BorrowStatus, type DamageStatus, type ItemCondition, type ItemStatus } from "@/lib/types";

interface ItemInputBody {
  itemCode?: string;
  name?: string;
  categoryId?: string;
  locationId?: string;
  totalQuantity?: number;
  availableQuantity?: number;
  unit?: string;
  condition?: ItemCondition;
  status?: ItemStatus;
  description?: string;
}

const ITEM_CONDITIONS: ItemCondition[] = ["baik", "butuh-perbaikan", "rusak", "hilang"];
const ITEM_STATUSES: ItemStatus[] = ["tersedia", "dipinjam", "rusak", "habis", "tidak-tersedia"];
const BORROW_STATUSES: BorrowStatus[] = ["menunggu", "disetujui", "ditolak", "selesai"];
const DAMAGE_STATUSES: DamageStatus[] = ["baru", "ditinjau", "diproses", "selesai"];

function parseNumber(value: unknown, fieldName: string): number {
  const num = typeof value === "string" ? Number(value) : (value as number);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
    throw new Error(`${fieldName} harus angka bulat >= 0.`);
  }
  return num;
}

export function parseItemInput(body: ItemInputBody) {
  const condition = (body.condition ?? "baik") as ItemCondition;
  if (!ITEM_CONDITIONS.includes(condition)) {
    throw new Error("Nilai condition item tidak valid.");
  }

  const status = (body.status ?? "tersedia") as ItemStatus;
  if (!ITEM_STATUSES.includes(status)) {
    throw new Error("Nilai status item tidak valid.");
  }

  return {
    itemCode: String(body.itemCode ?? ""),
    name: String(body.name ?? ""),
    categoryId: String(body.categoryId ?? ""),
    locationId: String(body.locationId ?? ""),
    totalQuantity: parseNumber(body.totalQuantity ?? 0, "Total quantity"),
    availableQuantity: parseNumber(body.availableQuantity ?? 0, "Available quantity"),
    unit: String(body.unit ?? ""),
    condition,
    status,
    description: String(body.description ?? ""),
  };
}

export function parseBorrowStatus(value: unknown): BorrowStatus {
  const status = String(value) as BorrowStatus;
  if (!BORROW_STATUSES.includes(status)) {
    throw new Error("Status peminjaman tidak valid.");
  }
  return status;
}

export function parseDamageStatus(value: unknown): DamageStatus {
  const status = String(value) as DamageStatus;
  if (!DAMAGE_STATUSES.includes(status)) {
    throw new Error("Status laporan kerusakan tidak valid.");
  }
  return status;
}

export function parseItemCondition(value: unknown): ItemCondition {
  const condition = String(value) as ItemCondition;
  if (!ITEM_CONDITIONS.includes(condition)) {
    throw new Error("Condition item tidak valid.");
  }
  return condition;
}

export function parseItemStatus(value: unknown): ItemStatus {
  const status = String(value) as ItemStatus;
  if (!ITEM_STATUSES.includes(status)) {
    throw new Error("Status item tidak valid.");
  }
  return status;
}

export function parsePositiveInt(value: unknown, fieldName: string): number {
  const num = typeof value === "string" ? Number(value) : (value as number);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
    throw new Error(`${fieldName} harus angka bulat > 0.`);
  }
  return num;
}
