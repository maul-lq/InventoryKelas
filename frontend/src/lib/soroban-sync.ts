import { execFile } from "child_process";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";
import {
  type BorrowRequest,
  type BorrowStatus,
  type Category,
  type DamageReport,
  type DamageStatus,
  type Item,
  type ItemCondition,
  type ItemStatus,
  type Location,
} from "@/lib/types";

const execFileAsync = promisify(execFile);
const SYNC_MAP_FILE_PATH = path.join(process.cwd(), "data", "soroban-sync-map.json");

interface SorobanSyncMap {
  categories: Record<string, string>;
  locations: Record<string, string>;
  items: Record<string, string>;
  borrowRequests: Record<string, string>;
  damageReports: Record<string, string>;
}

interface SorobanSyncConfig {
  enabled: boolean;
  contractId: string;
  sourceAccount: string;
  network?: string;
  rpcUrl?: string;
  networkPassphrase?: string;
}

let syncLock: Promise<void> = Promise.resolve();

function getConfig(): SorobanSyncConfig {
  const contractId = process.env.SOROBAN_CONTRACT_ID?.trim() ?? "";
  const sourceAccount = process.env.SOROBAN_SOURCE_ACCOUNT?.trim() ?? "";

  return {
    enabled: contractId.length > 0 && sourceAccount.length > 0,
    contractId,
    sourceAccount,
    network: process.env.SOROBAN_NETWORK?.trim() || process.env.STELLAR_NETWORK?.trim() || "testnet",
    rpcUrl: process.env.SOROBAN_RPC_URL?.trim() || process.env.STELLAR_RPC_URL?.trim(),
    networkPassphrase:
      process.env.SOROBAN_NETWORK_PASSPHRASE?.trim() || process.env.STELLAR_NETWORK_PASSPHRASE?.trim(),
  };
}

function defaultSyncMap(): SorobanSyncMap {
  return {
    categories: {},
    locations: {},
    items: {},
    borrowRequests: {},
    damageReports: {},
  };
}

async function ensureSyncMapExists(): Promise<void> {
  await mkdir(path.dirname(SYNC_MAP_FILE_PATH), { recursive: true });
  try {
    await readFile(SYNC_MAP_FILE_PATH, "utf8");
  } catch {
    await writeFile(SYNC_MAP_FILE_PATH, JSON.stringify(defaultSyncMap(), null, 2), "utf8");
  }
}

async function readSyncMap(): Promise<SorobanSyncMap> {
  await ensureSyncMapExists();
  const raw = await readFile(SYNC_MAP_FILE_PATH, "utf8");
  return JSON.parse(raw) as SorobanSyncMap;
}

async function writeSyncMap(syncMap: SorobanSyncMap): Promise<void> {
  await writeFile(SYNC_MAP_FILE_PATH, JSON.stringify(syncMap, null, 2), "utf8");
}

async function withSyncMap<T>(mutator: (syncMap: SorobanSyncMap) => Promise<T> | T): Promise<T> {
  const previous = syncLock;
  let release: () => void = () => undefined;
  syncLock = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;
  try {
    const syncMap = await readSyncMap();
    const result = await mutator(syncMap);
    await writeSyncMap(syncMap);
    return result;
  } finally {
    release();
  }
}

function parseU64(output: string): string {
  const match = output.match(/\b(\d+)\b/);
  if (!match) {
    throw new Error(`Gagal membaca id dari output Soroban: ${output}`);
  }
  return match[1];
}

function conditionToContract(condition: ItemCondition): string {
  const map: Record<ItemCondition, string> = {
    baik: "Baik",
    "butuh-perbaikan": "ButuhPerbaikan",
    rusak: "Rusak",
    hilang: "Hilang",
  };
  return map[condition];
}

function itemStatusToContract(status: ItemStatus): string {
  const map: Record<ItemStatus, string> = {
    tersedia: "Tersedia",
    dipinjam: "Dipinjam",
    rusak: "Rusak",
    habis: "Habis",
    "tidak-tersedia": "TidakTersedia",
  };
  return map[status];
}

function borrowStatusToContract(status: BorrowStatus): string {
  const map: Record<BorrowStatus, string> = {
    menunggu: "Menunggu",
    disetujui: "Disetujui",
    ditolak: "Ditolak",
    selesai: "Selesai",
  };
  return map[status];
}

function damageStatusToContract(status: DamageStatus): string {
  const map: Record<DamageStatus, string> = {
    baru: "Baru",
    ditinjau: "Ditinjau",
    diproses: "Diproses",
    selesai: "Selesai",
  };
  return map[status];
}

function toCliArgValue(value: string | number): string {
  if (typeof value === "string" && value.length === 0) {
    // Stellar CLI rejects truly empty values for named args, use single space as explicit empty text.
    return " ";
  }
  return String(value);
}

async function invokeContract(
  functionName: string,
  args: Record<string, string | number>,
): Promise<string> {
  const config = getConfig();
  if (!config.enabled) {
    throw new Error("Soroban sync tidak aktif. Set SOROBAN_CONTRACT_ID dan SOROBAN_SOURCE_ACCOUNT.");
  }

  const cliArgs = [
    "contract",
    "invoke",
    "--id",
    config.contractId,
    "--source-account",
    config.sourceAccount,
    "--send=yes",
  ];

  if (config.network) {
    cliArgs.push("--network", config.network);
  }

  if (config.rpcUrl) {
    cliArgs.push("--rpc-url", config.rpcUrl);
  }

  if (config.networkPassphrase) {
    cliArgs.push("--network-passphrase", config.networkPassphrase);
  }

  cliArgs.push("--quiet", "--", functionName);

  for (const [key, value] of Object.entries(args)) {
    cliArgs.push(`--${key}`, toCliArgValue(value));
  }

  const { stdout, stderr } = await execFileAsync("stellar", cliArgs, {
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });

  const output = `${stdout ?? ""}${stderr ?? ""}`.trim();
  return output;
}

async function ensureCategoryContractId(category: Category): Promise<string> {
  return withSyncMap(async (syncMap) => {
    const existing = syncMap.categories[category.id];
    if (existing) {
      return existing;
    }

    const output = await invokeContract("create_category", {
      name: category.name,
      description: category.description,
    });
    const categoryId = parseU64(output);
    syncMap.categories[category.id] = categoryId;
    return categoryId;
  });
}

async function ensureLocationContractId(location: Location): Promise<string> {
  return withSyncMap(async (syncMap) => {
    const existing = syncMap.locations[location.id];
    if (existing) {
      return existing;
    }

    const output = await invokeContract("create_location", {
      name: location.name,
      description: location.description,
    });
    const locationId = parseU64(output);
    syncMap.locations[location.id] = locationId;
    return locationId;
  });
}

async function ensureItemContractId(
  item: Item,
  categoryContractId: string,
  locationContractId: string,
): Promise<string> {
  return withSyncMap(async (syncMap) => {
    const existing = syncMap.items[item.id];
    if (existing) {
      return existing;
    }

    const output = await invokeContract("create_item", {
      item_code: item.itemCode,
      name: item.name,
      category_id: categoryContractId,
      location_id: locationContractId,
      total_quantity: item.totalQuantity,
      available_quantity: item.availableQuantity,
      unit: item.unit,
      condition: conditionToContract(item.condition),
      requested_status: itemStatusToContract(item.status),
      description: item.description,
    });

    const itemId = parseU64(output);
    syncMap.items[item.id] = itemId;
    return itemId;
  });
}

export function isSorobanSyncEnabled(): boolean {
  return getConfig().enabled;
}

export async function syncCategoryCreate(category: Category): Promise<void> {
  await ensureCategoryContractId(category);
}

export async function syncCategoryUpdate(category: Category): Promise<void> {
  const categoryContractId = await ensureCategoryContractId(category);
  await invokeContract("update_category", {
    category_id: categoryContractId,
    name: category.name,
    description: category.description,
  });
}

export async function syncCategoryDelete(categoryId: string): Promise<void> {
  await withSyncMap(async (syncMap) => {
    const categoryContractId = syncMap.categories[categoryId];
    if (!categoryContractId) {
      return;
    }

    await invokeContract("delete_category", {
      category_id: categoryContractId,
    });
    delete syncMap.categories[categoryId];
  });
}

export async function syncLocationCreate(location: Location): Promise<void> {
  await ensureLocationContractId(location);
}

export async function syncLocationUpdate(location: Location): Promise<void> {
  const locationContractId = await ensureLocationContractId(location);
  await invokeContract("update_location", {
    location_id: locationContractId,
    name: location.name,
    description: location.description,
  });
}

export async function syncLocationDelete(locationId: string): Promise<void> {
  await withSyncMap(async (syncMap) => {
    const locationContractId = syncMap.locations[locationId];
    if (!locationContractId) {
      return;
    }

    await invokeContract("delete_location", {
      location_id: locationContractId,
    });
    delete syncMap.locations[locationId];
  });
}

export async function syncItemCreate(item: Item, category: Category, location: Location): Promise<void> {
  const categoryContractId = await ensureCategoryContractId(category);
  const locationContractId = await ensureLocationContractId(location);
  await ensureItemContractId(item, categoryContractId, locationContractId);
}

export async function syncItemUpdate(item: Item, category: Category, location: Location): Promise<void> {
  const categoryContractId = await ensureCategoryContractId(category);
  const locationContractId = await ensureLocationContractId(location);
  const itemContractId = await ensureItemContractId(item, categoryContractId, locationContractId);

  await invokeContract("update_item", {
    item_id: itemContractId,
    item_code: item.itemCode,
    name: item.name,
    category_id: categoryContractId,
    location_id: locationContractId,
    total_quantity: item.totalQuantity,
    available_quantity: item.availableQuantity,
    unit: item.unit,
    condition: conditionToContract(item.condition),
    requested_status: itemStatusToContract(item.status),
    description: item.description,
  });
}

export async function syncItemDelete(itemId: string): Promise<void> {
  await withSyncMap(async (syncMap) => {
    const itemContractId = syncMap.items[itemId];
    if (!itemContractId) {
      return;
    }

    await invokeContract("delete_item", {
      item_id: itemContractId,
    });

    delete syncMap.items[itemId];
  });
}

export async function syncBorrowCreate(request: BorrowRequest, itemId: string): Promise<void> {
  await withSyncMap(async (syncMap) => {
    const itemContractId = syncMap.items[itemId];
    if (!itemContractId) {
      throw new Error("Item belum tersinkron ke Soroban saat create borrow request.");
    }

    const output = await invokeContract("create_borrow_request", {
      item_id: itemContractId,
      user_id: request.userId,
      quantity: request.quantity,
      purpose: request.purpose,
      borrow_date: request.borrowDate,
      expected_return_date: request.expectedReturnDate,
      user_note: request.userNote,
    });

    const borrowId = parseU64(output);
    syncMap.borrowRequests[request.id] = borrowId;
  });
}

export async function syncBorrowStatusUpdate(request: BorrowRequest, actorUserId: string): Promise<void> {
  await withSyncMap(async (syncMap) => {
    const borrowContractId = syncMap.borrowRequests[request.id];
    if (!borrowContractId) {
      return;
    }

    await invokeContract("update_borrow_status", {
      borrow_id: borrowContractId,
      status: borrowStatusToContract(request.status),
      admin_note: request.adminNote,
      approved_by: actorUserId,
    });
  });
}

export async function syncDamageCreate(report: DamageReport, itemId: string): Promise<void> {
  await withSyncMap(async (syncMap) => {
    const itemContractId = syncMap.items[itemId];
    if (!itemContractId) {
      throw new Error("Item belum tersinkron ke Soroban saat create damage report.");
    }

    const output = await invokeContract("create_damage_report", {
      item_id: itemContractId,
      user_id: report.userId,
      issue_type: report.issueType,
      description: report.description,
    });

    const reportId = parseU64(output);
    syncMap.damageReports[report.id] = reportId;
  });
}

export async function syncDamageStatusUpdate(
  report: DamageReport,
  actorUserId: string,
  itemCondition: ItemCondition,
  itemStatus: ItemStatus,
): Promise<void> {
  await withSyncMap(async (syncMap) => {
    const reportContractId = syncMap.damageReports[report.id];
    if (!reportContractId) {
      return;
    }

    await invokeContract("update_damage_status", {
      damage_id: reportContractId,
      status: damageStatusToContract(report.status),
      follow_up_note: report.followUpNote,
      handled_by: actorUserId,
      item_condition: conditionToContract(itemCondition),
      requested_item_status: itemStatusToContract(itemStatus),
    });
  });
}
