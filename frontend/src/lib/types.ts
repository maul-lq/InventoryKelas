export type Role = "admin" | "mahasiswa";

export type ItemCondition =
  | "baik"
  | "butuh-perbaikan"
  | "rusak"
  | "hilang";

export type ItemStatus =
  | "tersedia"
  | "dipinjam"
  | "rusak"
  | "habis"
  | "tidak-tersedia";

export type BorrowStatus = "menunggu" | "disetujui" | "ditolak" | "selesai";

export type DamageStatus = "baru" | "ditinjau" | "diproses" | "selesai";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  itemCode: string;
  name: string;
  categoryId: string;
  locationId: string;
  totalQuantity: number;
  availableQuantity: number;
  unit: string;
  condition: ItemCondition;
  status: ItemStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowRequest {
  id: string;
  itemId: string;
  userId: string;
  quantity: number;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  status: BorrowStatus;
  userNote: string;
  adminNote: string;
  approvedBy: string | null;
  approvedAt: string | null;
  returnedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DamageReport {
  id: string;
  itemId: string;
  userId: string;
  issueType: string;
  description: string;
  status: DamageStatus;
  followUpNote: string;
  handledBy: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  actorUserId: string | null;
  event: string;
  entityType: "item" | "category" | "location" | "borrow" | "damage" | "auth";
  entityId: string;
  message: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalItems: number;
  totalAvailableItems: number;
  totalBorrowedItems: number;
  totalBrokenItems: number;
  totalOutOfStockItems: number;
  pendingBorrowRequests: number;
  activeDamageReports: number;
}

export interface DatabaseShape {
  meta: {
    createdAt: string;
    updatedAt: string;
  };
  users: User[];
  sessions: SessionRecord[];
  categories: Category[];
  locations: Location[];
  items: Item[];
  borrowRequests: BorrowRequest[];
  damageReports: DamageReport[];
  activityLogs: ActivityLog[];
}
