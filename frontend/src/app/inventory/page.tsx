import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { requirePageUser } from "@/lib/page-auth";
import { listCategories, listItems, listLocations } from "@/lib/store";
import { type ItemStatus } from "@/lib/types";

interface InventoryPageProps {
  searchParams: Promise<{
    categoryId?: string;
    locationId?: string;
    status?: ItemStatus;
    q?: string;
  }>;
}

function statusTone(status: ItemStatus): "neutral" | "success" | "warning" | "danger" {
  if (status === "tersedia") {
    return "success";
  }
  if (status === "habis") {
    return "warning";
  }
  if (status === "rusak" || status === "tidak-tersedia") {
    return "danger";
  }
  return "neutral";
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const user = await requirePageUser();
  const filters = await searchParams;

  const [items, categories, locations] = await Promise.all([
    listItems({
      categoryId: filters.categoryId,
      locationId: filters.locationId,
      status: filters.status,
      keyword: filters.q,
    }),
    listCategories(),
    listLocations(),
  ]);

  return (
    <AppShell user={user} title="Daftar Inventaris" subtitle="Lihat, filter, dan buka detail seluruh item inventaris kelas.">
      <section className="card mb-6 p-4">
        <form className="grid gap-3 md:grid-cols-5">
          <input name="q" defaultValue={filters.q ?? ""} placeholder="Cari nama, kode, deskripsi" className="input md:col-span-2" />

          <select name="categoryId" defaultValue={filters.categoryId ?? ""} className="select">
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select name="locationId" defaultValue={filters.locationId ?? ""} className="select">
            <option value="">Semua lokasi</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <select name="status" defaultValue={filters.status ?? ""} className="select">
              <option value="">Semua status</option>
              <option value="tersedia">Tersedia</option>
              <option value="dipinjam">Dipinjam</option>
              <option value="rusak">Rusak</option>
              <option value="habis">Habis</option>
              <option value="tidak-tersedia">Tidak tersedia</option>
            </select>
            <button type="submit" className="btn btn-primary">
              Filter
            </button>
          </div>
        </form>
      </section>

      <section className="card p-4">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Lokasi</th>
                <th>Stok</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const category = categories.find((row) => row.id === item.categoryId);
                const location = locations.find((row) => row.id === item.locationId);

                return (
                  <tr key={item.id}>
                    <td>{item.itemCode}</td>
                    <td>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-600">{item.description || "-"}</p>
                    </td>
                    <td>{category?.name ?? "-"}</td>
                    <td>{location?.name ?? "-"}</td>
                    <td>
                      {item.availableQuantity}/{item.totalQuantity} {item.unit}
                    </td>
                    <td>
                      <StatusPill text={item.status} tone={statusTone(item.status)} />
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/inventory/${item.id}`} className="btn btn-muted">
                          Detail
                        </Link>
                        <Link href={`/borrow/${item.id}`} className="btn btn-muted">
                          Ajukan Pinjam
                        </Link>
                        <Link href={`/damage-report/${item.id}`} className="btn btn-muted">
                          Lapor Kerusakan
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7}>Tidak ada item sesuai filter.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
