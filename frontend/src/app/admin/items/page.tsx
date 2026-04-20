import Link from "next/link";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { requirePageUser } from "@/lib/page-auth";
import { deleteItem, listCategories, listItems, listLocations } from "@/lib/store";

async function deleteItemAction(itemId: string) {
  "use server";
  const admin = await requirePageUser(["admin"]);
  await deleteItem(itemId, admin.id);
  revalidatePath("/admin/items");
  revalidatePath("/inventory");
}

export default async function AdminItemsPage() {
  const user = await requirePageUser(["admin"]);

  const [items, categories, locations] = await Promise.all([
    listItems(),
    listCategories(),
    listLocations(),
  ]);

  return (
    <AppShell user={user} title="Manajemen Item" subtitle="CRUD item inventaris kelas.">
      <section className="mb-4">
        <Link href="/admin/items/new" className="btn btn-primary">
          Tambah Item Baru
        </Link>
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
                const category = categories.find((entry) => entry.id === item.categoryId);
                const location = locations.find((entry) => entry.id === item.locationId);

                return (
                  <tr key={item.id}>
                    <td>{item.itemCode}</td>
                    <td>{item.name}</td>
                    <td>{category?.name ?? "-"}</td>
                    <td>{location?.name ?? "-"}</td>
                    <td>
                      {item.availableQuantity}/{item.totalQuantity} {item.unit}
                    </td>
                    <td>
                      <StatusPill text={item.status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/admin/items/${item.id}`} className="btn btn-muted">
                          Edit
                        </Link>
                        <form action={deleteItemAction.bind(null, item.id)}>
                          <button type="submit" className="btn btn-muted">
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7}>Belum ada item inventaris.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
