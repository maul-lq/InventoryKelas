import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  type ActivityLog,
  type BorrowRequest,
  type BorrowStatus,
  type Category,
  type DamageReport,
  type DamageStatus,
  type DashboardSummary,
  type DatabaseShape,
  type Item,
  type ItemCondition,
  type ItemStatus,
  type Location,
  type SessionRecord,
  type User,
} from "@/lib/types";

const DB_FILE_PATH = path.join(process.cwd(), "data", "inventra-db.json");

let lock: Promise<void> = Promise.resolve();

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

function toDateOnly(value: string): string {
  return value.slice(0, 10);
}

function normalizeItemStatus(item: Pick<Item, "condition" | "availableQuantity" | "status">): ItemStatus {
  if (item.condition === "rusak" || item.condition === "hilang") {
    return "rusak";
  }
  if (item.availableQuantity <= 0) {
    return "habis";
  }
  if (item.status === "tidak-tersedia") {
    return "tidak-tersedia";
  }
  return "tersedia";
}

function buildSeedDatabase(): DatabaseShape {
  const createdAt = nowIso();

  const adminId = "user_admin_seed";
  const mahasiswaId = "user_mahasiswa_seed";
  const categoryLabId = "cat_lab";
  const categoryFurnitureId = "cat_furniture";
  const categoryConsumableId = "cat_consumable";
  const locationAId = "loc_a101";
  const locationBId = "loc_lab_komputer";

  return {
    meta: {
      createdAt,
      updatedAt: createdAt,
    },
    users: [
      {
        id: adminId,
        name: "Admin Inventra",
        email: "admin@pnj.ac.id",
        password: "admin123",
        role: "admin",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: mahasiswaId,
        name: "Mahasiswa PNJ",
        email: "mhs@pnj.ac.id",
        password: "mhs123",
        role: "mahasiswa",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    sessions: [],
    categories: [
      {
        id: categoryLabId,
        name: "Peralatan Lab",
        description: "Peralatan elektronik dan praktikum",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: categoryFurnitureId,
        name: "Furniture",
        description: "Meja, kursi, lemari, dan aset ruangan",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: categoryConsumableId,
        name: "Barang Habis Pakai",
        description: "Barang konsumsi operasional kelas",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    locations: [
      {
        id: locationAId,
        name: "Ruang A101",
        description: "Kelas teori lantai 1",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: locationBId,
        name: "Lab Komputer",
        description: "Laboratorium praktikum TI",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    items: [
      {
        id: "item_projector_a101",
        itemCode: "PNJ-INV-001",
        name: "Proyektor Epson",
        categoryId: categoryLabId,
        locationId: locationAId,
        totalQuantity: 2,
        availableQuantity: 2,
        unit: "unit",
        condition: "baik",
        status: "tersedia",
        description: "Proyektor utama untuk presentasi kelas",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "item_kursi_lab",
        itemCode: "PNJ-INV-002",
        name: "Kursi Lab",
        categoryId: categoryFurnitureId,
        locationId: locationBId,
        totalQuantity: 40,
        availableQuantity: 40,
        unit: "buah",
        condition: "baik",
        status: "tersedia",
        description: "Kursi untuk mahasiswa di ruang lab",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "item_spidol",
        itemCode: "PNJ-INV-003",
        name: "Spidol Whiteboard",
        categoryId: categoryConsumableId,
        locationId: locationAId,
        totalQuantity: 20,
        availableQuantity: 20,
        unit: "buah",
        condition: "baik",
        status: "tersedia",
        description: "Spidol cadangan untuk papan tulis",
        createdAt,
        updatedAt: createdAt,
      },
    ],
    borrowRequests: [],
    damageReports: [],
    activityLogs: [
      {
        id: makeId("activity"),
        actorUserId: null,
        event: "seed.created",
        entityType: "auth",
        entityId: "system",
        message: "Database seed Inventra PNJ dibuat.",
        createdAt,
      },
    ],
  };
}

async function ensureDatabaseExists(): Promise<void> {
  await mkdir(path.dirname(DB_FILE_PATH), { recursive: true });
  try {
    await readFile(DB_FILE_PATH, "utf8");
  } catch {
    const seed = buildSeedDatabase();
    await writeFile(DB_FILE_PATH, JSON.stringify(seed, null, 2), "utf8");
  }
}

async function readDb(): Promise<DatabaseShape> {
  await ensureDatabaseExists();
  const raw = await readFile(DB_FILE_PATH, "utf8");
  return JSON.parse(raw) as DatabaseShape;
}

async function writeDb(nextDb: DatabaseShape): Promise<void> {
  await writeFile(DB_FILE_PATH, JSON.stringify(nextDb, null, 2), "utf8");
}

async function withMutation<T>(mutator: (db: DatabaseShape) => Promise<T> | T): Promise<T> {
  const previous = lock;
  let release: (() => void) | null = null;
  lock = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    const db = await readDb();
    const result = await mutator(db);
    db.meta.updatedAt = nowIso();
    await writeDb(db);
    return result;
  } finally {
    if (release) {
      release();
    }
  }
}

function addActivity(
  db: DatabaseShape,
  actorUserId: string | null,
  event: string,
  entityType: ActivityLog["entityType"],
  entityId: string,
  message: string,
): void {
  db.activityLogs.unshift({
    id: makeId("activity"),
    actorUserId,
    event,
    entityType,
    entityId,
    message,
    createdAt: nowIso(),
  });

  if (db.activityLogs.length > 300) {
    db.activityLogs = db.activityLogs.slice(0, 300);
  }
}

function findCategory(db: DatabaseShape, categoryId: string): Category {
  const category = db.categories.find((entry) => entry.id === categoryId);
  if (!category) {
    throw new Error("Kategori tidak ditemukan.");
  }
  return category;
}

function findLocation(db: DatabaseShape, locationId: string): Location {
  const location = db.locations.find((entry) => entry.id === locationId);
  if (!location) {
    throw new Error("Lokasi tidak ditemukan.");
  }
  return location;
}

function findItem(db: DatabaseShape, itemId: string): Item {
  const item = db.items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error("Item tidak ditemukan.");
  }
  return item;
}

function findBorrow(db: DatabaseShape, borrowId: string): BorrowRequest {
  const borrow = db.borrowRequests.find((entry) => entry.id === borrowId);
  if (!borrow) {
    throw new Error("Pengajuan peminjaman tidak ditemukan.");
  }
  return borrow;
}

function findDamage(db: DatabaseShape, reportId: string): DamageReport {
  const report = db.damageReports.find((entry) => entry.id === reportId);
  if (!report) {
    throw new Error("Laporan kerusakan tidak ditemukan.");
  }
  return report;
}

function findUser(db: DatabaseShape, userId: string): User {
  const user = db.users.find((entry) => entry.id === userId);
  if (!user) {
    throw new Error("User tidak ditemukan.");
  }
  return user;
}

export async function listUsers(): Promise<User[]> {
  const db = await readDb();
  return db.users;
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await readDb();
  return db.users.find((entry) => entry.id === userId) ?? null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await readDb();
  return db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createSession(userId: string, ttlDays = 7): Promise<SessionRecord> {
  return withMutation((db) => {
    findUser(db, userId);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    const session: SessionRecord = {
      token: makeId("session"),
      userId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    db.sessions = db.sessions.filter((entry) => entry.expiresAt > now.toISOString());
    db.sessions.push(session);

    addActivity(db, userId, "auth.login", "auth", session.token, "User login berhasil.");
    return session;
  });
}

export async function getSession(token: string): Promise<SessionRecord | null> {
  const db = await readDb();
  const session = db.sessions.find((entry) => entry.token === token) ?? null;
  if (!session) {
    return null;
  }
  if (session.expiresAt <= nowIso()) {
    await withMutation((mutationDb) => {
      mutationDb.sessions = mutationDb.sessions.filter((entry) => entry.token !== token);
      return null;
    });
    return null;
  }
  return session;
}

export async function deleteSession(token: string, actorUserId: string | null): Promise<void> {
  await withMutation((db) => {
    db.sessions = db.sessions.filter((entry) => entry.token !== token);
    addActivity(db, actorUserId, "auth.logout", "auth", token, "User logout.");
  });
}

export async function listCategories(): Promise<Category[]> {
  const db = await readDb();
  return [...db.categories].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(input: {
  actorUserId: string;
  name: string;
  description: string;
}): Promise<Category> {
  return withMutation((db) => {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Nama kategori wajib diisi.");
    }

    const duplicate = db.categories.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      throw new Error("Kategori sudah ada.");
    }

    const createdAt = nowIso();
    const category: Category = {
      id: makeId("cat"),
      name,
      description: input.description.trim(),
      createdAt,
      updatedAt: createdAt,
    };

    db.categories.push(category);
    addActivity(db, input.actorUserId, "category.create", "category", category.id, `Kategori ${name} dibuat.`);
    return category;
  });
}

export async function updateCategory(
  categoryId: string,
  input: {
    actorUserId: string;
    name: string;
    description: string;
  },
): Promise<Category> {
  return withMutation((db) => {
    const category = findCategory(db, categoryId);
    const nextName = input.name.trim();

    if (!nextName) {
      throw new Error("Nama kategori wajib diisi.");
    }

    const duplicate = db.categories.find(
      (entry) => entry.id !== categoryId && entry.name.toLowerCase() === nextName.toLowerCase(),
    );
    if (duplicate) {
      throw new Error("Nama kategori sudah dipakai.");
    }

    category.name = nextName;
    category.description = input.description.trim();
    category.updatedAt = nowIso();

    addActivity(db, input.actorUserId, "category.update", "category", category.id, `Kategori ${nextName} diperbarui.`);
    return category;
  });
}

export async function deleteCategory(categoryId: string, actorUserId: string): Promise<void> {
  await withMutation((db) => {
    findCategory(db, categoryId);
    const hasItem = db.items.some((item) => item.categoryId === categoryId);
    if (hasItem) {
      throw new Error("Kategori masih dipakai oleh item inventaris.");
    }

    db.categories = db.categories.filter((entry) => entry.id !== categoryId);
    addActivity(db, actorUserId, "category.delete", "category", categoryId, "Kategori dihapus.");
  });
}

export async function listLocations(): Promise<Location[]> {
  const db = await readDb();
  return [...db.locations].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createLocation(input: {
  actorUserId: string;
  name: string;
  description: string;
}): Promise<Location> {
  return withMutation((db) => {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Nama lokasi wajib diisi.");
    }

    const duplicate = db.locations.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      throw new Error("Lokasi sudah ada.");
    }

    const createdAt = nowIso();
    const location: Location = {
      id: makeId("loc"),
      name,
      description: input.description.trim(),
      createdAt,
      updatedAt: createdAt,
    };

    db.locations.push(location);
    addActivity(db, input.actorUserId, "location.create", "location", location.id, `Lokasi ${name} dibuat.`);
    return location;
  });
}

export async function updateLocation(
  locationId: string,
  input: {
    actorUserId: string;
    name: string;
    description: string;
  },
): Promise<Location> {
  return withMutation((db) => {
    const location = findLocation(db, locationId);
    const nextName = input.name.trim();
    if (!nextName) {
      throw new Error("Nama lokasi wajib diisi.");
    }

    const duplicate = db.locations.find(
      (entry) => entry.id !== locationId && entry.name.toLowerCase() === nextName.toLowerCase(),
    );
    if (duplicate) {
      throw new Error("Nama lokasi sudah dipakai.");
    }

    location.name = nextName;
    location.description = input.description.trim();
    location.updatedAt = nowIso();

    addActivity(db, input.actorUserId, "location.update", "location", location.id, `Lokasi ${nextName} diperbarui.`);
    return location;
  });
}

export async function deleteLocation(locationId: string, actorUserId: string): Promise<void> {
  await withMutation((db) => {
    findLocation(db, locationId);
    const hasItem = db.items.some((item) => item.locationId === locationId);
    if (hasItem) {
      throw new Error("Lokasi masih dipakai oleh item inventaris.");
    }

    db.locations = db.locations.filter((entry) => entry.id !== locationId);
    addActivity(db, actorUserId, "location.delete", "location", locationId, "Lokasi dihapus.");
  });
}

export interface ItemFilters {
  categoryId?: string;
  locationId?: string;
  status?: ItemStatus;
  keyword?: string;
}

export async function listItems(filters: ItemFilters = {}): Promise<Item[]> {
  const db = await readDb();

  return db.items
    .filter((item) => {
      if (filters.categoryId && item.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.locationId && item.locationId !== filters.locationId) {
        return false;
      }
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      if (filters.keyword) {
        const q = filters.keyword.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.itemCode.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getItemById(itemId: string): Promise<Item | null> {
  const db = await readDb();
  return db.items.find((entry) => entry.id === itemId) ?? null;
}

function parseNonNegativeInt(value: number, fieldName: string): number {
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
    throw new Error(`${fieldName} harus berupa bilangan bulat >= 0.`);
  }
  return value;
}

export async function createItem(input: {
  actorUserId: string;
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
}): Promise<Item> {
  return withMutation((db) => {
    const itemCode = input.itemCode.trim();
    const name = input.name.trim();
    const unit = input.unit.trim();

    if (!itemCode) {
      throw new Error("Kode barang wajib diisi.");
    }
    if (!name) {
      throw new Error("Nama barang wajib diisi.");
    }
    if (!unit) {
      throw new Error("Satuan wajib diisi.");
    }

    const duplicateCode = db.items.find((entry) => entry.itemCode.toLowerCase() === itemCode.toLowerCase());
    if (duplicateCode) {
      throw new Error("Kode barang sudah dipakai.");
    }

    findCategory(db, input.categoryId);
    findLocation(db, input.locationId);

    const totalQuantity = parseNonNegativeInt(input.totalQuantity, "Total quantity");
    const availableQuantity = parseNonNegativeInt(input.availableQuantity, "Available quantity");

    if (availableQuantity > totalQuantity) {
      throw new Error("Stok tersedia tidak boleh lebih besar dari stok total.");
    }

    const createdAt = nowIso();
    const item: Item = {
      id: makeId("item"),
      itemCode,
      name,
      categoryId: input.categoryId,
      locationId: input.locationId,
      totalQuantity,
      availableQuantity,
      unit,
      condition: input.condition,
      status: normalizeItemStatus({
        condition: input.condition,
        availableQuantity,
        status: input.status,
      }),
      description: input.description.trim(),
      createdAt,
      updatedAt: createdAt,
    };

    db.items.push(item);
    addActivity(db, input.actorUserId, "item.create", "item", item.id, `Item ${item.name} dibuat.`);
    return item;
  });
}

export async function updateItem(
  itemId: string,
  input: {
    actorUserId: string;
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
  },
): Promise<Item> {
  return withMutation((db) => {
    const item = findItem(db, itemId);

    const itemCode = input.itemCode.trim();
    const name = input.name.trim();
    const unit = input.unit.trim();

    if (!itemCode) {
      throw new Error("Kode barang wajib diisi.");
    }
    if (!name) {
      throw new Error("Nama barang wajib diisi.");
    }
    if (!unit) {
      throw new Error("Satuan wajib diisi.");
    }

    const duplicateCode = db.items.find(
      (entry) => entry.id !== itemId && entry.itemCode.toLowerCase() === itemCode.toLowerCase(),
    );
    if (duplicateCode) {
      throw new Error("Kode barang sudah dipakai.");
    }

    findCategory(db, input.categoryId);
    findLocation(db, input.locationId);

    const totalQuantity = parseNonNegativeInt(input.totalQuantity, "Total quantity");
    const availableQuantity = parseNonNegativeInt(input.availableQuantity, "Available quantity");

    if (availableQuantity > totalQuantity) {
      throw new Error("Stok tersedia tidak boleh lebih besar dari stok total.");
    }

    item.itemCode = itemCode;
    item.name = name;
    item.categoryId = input.categoryId;
    item.locationId = input.locationId;
    item.totalQuantity = totalQuantity;
    item.availableQuantity = availableQuantity;
    item.unit = unit;
    item.condition = input.condition;
    item.status = normalizeItemStatus({
      condition: input.condition,
      availableQuantity,
      status: input.status,
    });
    item.description = input.description.trim();
    item.updatedAt = nowIso();

    addActivity(db, input.actorUserId, "item.update", "item", item.id, `Item ${item.name} diperbarui.`);
    return item;
  });
}

export async function deleteItem(itemId: string, actorUserId: string): Promise<void> {
  await withMutation((db) => {
    findItem(db, itemId);

    const hasActiveBorrow = db.borrowRequests.some(
      (entry) => entry.itemId === itemId && (entry.status === "menunggu" || entry.status === "disetujui"),
    );

    if (hasActiveBorrow) {
      throw new Error("Item punya pengajuan aktif dan tidak bisa dihapus.");
    }

    db.items = db.items.filter((entry) => entry.id !== itemId);
    addActivity(db, actorUserId, "item.delete", "item", itemId, "Item inventaris dihapus.");
  });
}

export interface BorrowListFilters {
  userId?: string;
  status?: BorrowStatus;
}

export async function listBorrowRequests(filters: BorrowListFilters = {}): Promise<BorrowRequest[]> {
  const db = await readDb();

  return db.borrowRequests
    .filter((entry) => {
      if (filters.userId && entry.userId !== filters.userId) {
        return false;
      }
      if (filters.status && entry.status !== filters.status) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getBorrowRequestById(requestId: string): Promise<BorrowRequest | null> {
  const db = await readDb();
  return db.borrowRequests.find((entry) => entry.id === requestId) ?? null;
}

export async function createBorrowRequest(input: {
  actorUserId: string;
  itemId: string;
  userId: string;
  quantity: number;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  userNote: string;
}): Promise<BorrowRequest> {
  return withMutation((db) => {
    const item = findItem(db, input.itemId);
    findUser(db, input.userId);

    if (item.status === "rusak" || item.status === "tidak-tersedia" || item.status === "habis") {
      throw new Error("Barang tidak tersedia untuk dipinjam.");
    }

    const quantity = parseNonNegativeInt(input.quantity, "Jumlah pinjam");
    if (quantity <= 0) {
      throw new Error("Jumlah pinjam minimal 1.");
    }

    if (quantity > item.availableQuantity) {
      throw new Error("Jumlah pinjam melebihi stok tersedia.");
    }

    const purpose = input.purpose.trim();
    if (!purpose) {
      throw new Error("Tujuan peminjaman wajib diisi.");
    }

    const borrowDate = toDateOnly(input.borrowDate);
    const expectedReturnDate = toDateOnly(input.expectedReturnDate);

    if (!borrowDate || !expectedReturnDate) {
      throw new Error("Tanggal pinjam dan tanggal rencana kembali wajib diisi.");
    }

    if (expectedReturnDate < borrowDate) {
      throw new Error("Tanggal kembali harus sama atau setelah tanggal pinjam.");
    }

    const createdAt = nowIso();
    const borrowRequest: BorrowRequest = {
      id: makeId("borrow"),
      itemId: item.id,
      userId: input.userId,
      quantity,
      purpose,
      borrowDate,
      expectedReturnDate,
      status: "menunggu",
      userNote: input.userNote.trim(),
      adminNote: "",
      approvedBy: null,
      approvedAt: null,
      returnedAt: null,
      createdAt,
      updatedAt: createdAt,
    };

    db.borrowRequests.push(borrowRequest);
    addActivity(
      db,
      input.actorUserId,
      "borrow.create",
      "borrow",
      borrowRequest.id,
      `Pengajuan peminjaman dibuat untuk item ${item.name}.`,
    );

    return borrowRequest;
  });
}

export async function updateBorrowRequestStatus(
  requestId: string,
  input: {
    actorUserId: string;
    status: BorrowStatus;
    adminNote: string;
  },
): Promise<BorrowRequest> {
  return withMutation((db) => {
    const request = findBorrow(db, requestId);
    const item = findItem(db, request.itemId);

    const nextStatus = input.status;
    const prevStatus = request.status;

    if (prevStatus === "selesai" && nextStatus !== "selesai") {
      throw new Error("Pengajuan yang sudah selesai tidak bisa dikembalikan ke status sebelumnya.");
    }

    if (prevStatus === "ditolak" && nextStatus === "selesai") {
      throw new Error("Pengajuan yang ditolak tidak bisa langsung diselesaikan.");
    }

    if (nextStatus === "disetujui" && prevStatus !== "disetujui") {
      if (request.quantity > item.availableQuantity) {
        throw new Error("Stok item tidak cukup untuk approval.");
      }
      item.availableQuantity -= request.quantity;
      item.status = normalizeItemStatus(item);
      item.updatedAt = nowIso();

      request.approvedBy = input.actorUserId;
      request.approvedAt = nowIso();
      request.returnedAt = null;
    }

    if (nextStatus === "selesai" && prevStatus !== "selesai") {
      if (prevStatus !== "disetujui") {
        throw new Error("Hanya pengajuan disetujui yang bisa diselesaikan.");
      }

      item.availableQuantity += request.quantity;
      if (item.availableQuantity > item.totalQuantity) {
        item.availableQuantity = item.totalQuantity;
      }
      item.status = normalizeItemStatus(item);
      item.updatedAt = nowIso();
      request.returnedAt = nowIso();
    }

    if (prevStatus === "disetujui" && nextStatus === "ditolak") {
      item.availableQuantity += request.quantity;
      if (item.availableQuantity > item.totalQuantity) {
        item.availableQuantity = item.totalQuantity;
      }
      item.status = normalizeItemStatus(item);
      item.updatedAt = nowIso();
      request.returnedAt = nowIso();
    }

    request.status = nextStatus;
    request.adminNote = input.adminNote.trim();
    request.updatedAt = nowIso();

    addActivity(
      db,
      input.actorUserId,
      "borrow.update-status",
      "borrow",
      request.id,
      `Status peminjaman diubah ke ${nextStatus}.`,
    );

    return request;
  });
}

export interface DamageListFilters {
  userId?: string;
  status?: DamageStatus;
}

export async function listDamageReports(filters: DamageListFilters = {}): Promise<DamageReport[]> {
  const db = await readDb();

  return db.damageReports
    .filter((entry) => {
      if (filters.userId && entry.userId !== filters.userId) {
        return false;
      }
      if (filters.status && entry.status !== filters.status) {
        return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getDamageReportById(reportId: string): Promise<DamageReport | null> {
  const db = await readDb();
  return db.damageReports.find((entry) => entry.id === reportId) ?? null;
}

export async function createDamageReport(input: {
  actorUserId: string;
  itemId: string;
  userId: string;
  issueType: string;
  description: string;
}): Promise<DamageReport> {
  return withMutation((db) => {
    const item = findItem(db, input.itemId);
    findUser(db, input.userId);

    const issueType = input.issueType.trim();
    const description = input.description.trim();

    if (!issueType) {
      throw new Error("Jenis masalah wajib diisi.");
    }

    if (!description) {
      throw new Error("Deskripsi laporan wajib diisi.");
    }

    const createdAt = nowIso();
    const report: DamageReport = {
      id: makeId("damage"),
      itemId: item.id,
      userId: input.userId,
      issueType,
      description,
      status: "baru",
      followUpNote: "",
      handledBy: null,
      handledAt: null,
      createdAt,
      updatedAt: createdAt,
    };

    db.damageReports.push(report);
    addActivity(
      db,
      input.actorUserId,
      "damage.create",
      "damage",
      report.id,
      `Laporan kerusakan dibuat untuk item ${item.name}.`,
    );

    return report;
  });
}

export async function updateDamageReportStatus(
  reportId: string,
  input: {
    actorUserId: string;
    status: DamageStatus;
    followUpNote: string;
    itemCondition?: ItemCondition;
    itemStatus?: ItemStatus;
  },
): Promise<DamageReport> {
  return withMutation((db) => {
    const report = findDamage(db, reportId);
    const item = findItem(db, report.itemId);

    report.status = input.status;
    report.followUpNote = input.followUpNote.trim();
    report.handledBy = input.actorUserId;
    report.handledAt = nowIso();
    report.updatedAt = nowIso();

    if (input.itemCondition) {
      item.condition = input.itemCondition;
    }

    if (input.itemStatus) {
      item.status = input.itemStatus;
    } else {
      item.status = normalizeItemStatus(item);
    }

    item.updatedAt = nowIso();

    addActivity(
      db,
      input.actorUserId,
      "damage.update-status",
      "damage",
      report.id,
      `Status laporan kerusakan diubah ke ${input.status}.`,
    );

    return report;
  });
}

export async function listActivityLogs(limit = 20): Promise<ActivityLog[]> {
  const db = await readDb();
  return db.activityLogs.slice(0, Math.max(1, limit));
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const db = await readDb();

  const totalItems = db.items.length;
  const totalAvailableItems = db.items.filter((item) => item.availableQuantity > 0 && item.status === "tersedia").length;
  const totalBorrowedItems = db.borrowRequests.filter((entry) => entry.status === "disetujui").length;
  const totalBrokenItems = db.items.filter((item) => item.status === "rusak" || item.condition !== "baik").length;
  const totalOutOfStockItems = db.items.filter((item) => item.availableQuantity === 0 || item.status === "habis").length;
  const pendingBorrowRequests = db.borrowRequests.filter((entry) => entry.status === "menunggu").length;
  const activeDamageReports = db.damageReports.filter((entry) => entry.status !== "selesai").length;

  return {
    totalItems,
    totalAvailableItems,
    totalBorrowedItems,
    totalBrokenItems,
    totalOutOfStockItems,
    pendingBorrowRequests,
    activeDamageReports,
  };
}
