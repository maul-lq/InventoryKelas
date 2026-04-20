import { type BorrowStatus, type DamageStatus, type ItemCondition, type ItemStatus } from "@/lib/types";

export const itemConditions: ItemCondition[] = ["baik", "butuh-perbaikan", "rusak", "hilang"];
export const itemStatuses: ItemStatus[] = ["tersedia", "dipinjam", "rusak", "habis", "tidak-tersedia"];
export const borrowStatuses: BorrowStatus[] = ["menunggu", "disetujui", "ditolak", "selesai"];
export const damageStatuses: DamageStatus[] = ["baru", "ditinjau", "diproses", "selesai"];
