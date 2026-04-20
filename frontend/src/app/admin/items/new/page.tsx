import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { itemConditions, itemStatuses } from "@/lib/options";
import { requirePageUser } from "@/lib/page-auth";
import { createItem, listCategories, listLocations } from "@/lib/store";

async function createItemAction(formData: FormData) {
  "use server";

  const admin = await requirePageUser(["admin"]);

  await createItem({
    actorUserId: admin.id,
    itemCode: String(formData.get("itemCode") ?? ""),
    name: String(formData.get("name") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    locationId: String(formData.get("locationId") ?? ""),
    totalQuantity: Number(formData.get("totalQuantity") ?? 0),
    availableQuantity: Number(formData.get("availableQuantity") ?? 0),
    unit: String(formData.get("unit") ?? ""),
    condition: String(formData.get("condition") ?? "baik") as never,
    status: String(formData.get("status") ?? "tersedia") as never,
    description: String(formData.get("description") ?? ""),
  });

  revalidatePath("/admin/items");
  revalidatePath("/inventory");
  redirect("/admin/items");
}

export default async function NewItemPage() {
  const user = await requirePageUser(["admin"]);

  const [categories, locations] = await Promise.all([listCategories(), listLocations()]);

  return (
    <AppShell user={user} title="Tambah Item" subtitle="Buat data item inventaris baru.">
      <section className="card p-5">
        <form action={createItemAction} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Kode Barang</label>
            <input name="itemCode" title="Kode barang" className="input" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nama Barang</label>
            <input name="name" title="Nama barang" className="input" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Kategori</label>
            <select name="categoryId" title="Kategori" className="select" required>
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Lokasi</label>
            <select name="locationId" title="Lokasi" className="select" required>
              <option value="">Pilih lokasi</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Total Quantity</label>
            <input type="number" min={0} name="totalQuantity" title="Total quantity" className="input" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Available Quantity</label>
            <input type="number" min={0} name="availableQuantity" title="Available quantity" className="input" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Satuan</label>
            <input name="unit" title="Satuan" className="input" defaultValue="unit" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Kondisi</label>
            <select name="condition" title="Kondisi" className="select" defaultValue="baik">
              {itemConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
            <select name="status" title="Status" className="select" defaultValue="tersedia">
              {itemStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Deskripsi</label>
            <textarea name="description" title="Deskripsi" className="textarea" rows={4} />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
            <Link href="/admin/items" className="btn btn-muted">
              Kembali
            </Link>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
