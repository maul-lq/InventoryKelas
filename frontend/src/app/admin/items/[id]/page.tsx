import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { itemConditions, itemStatuses } from "@/lib/options";
import { requirePageUser } from "@/lib/page-auth";
import { deleteItem, getItemById, listCategories, listLocations, updateItem } from "@/lib/store";

interface EditItemPageProps {
  params: Promise<{ id: string }>;
}

async function updateItemAction(itemId: string, formData: FormData) {
  "use server";
  const admin = await requirePageUser(["admin"]);

  await updateItem(itemId, {
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
  revalidatePath(`/admin/items/${itemId}`);
  revalidatePath("/inventory");
  redirect("/admin/items");
}

async function deleteItemAction(itemId: string) {
  "use server";
  const admin = await requirePageUser(["admin"]);
  await deleteItem(itemId, admin.id);
  revalidatePath("/admin/items");
  revalidatePath("/inventory");
  redirect("/admin/items");
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const user = await requirePageUser(["admin"]);
  const { id } = await params;

  const [item, categories, locations] = await Promise.all([getItemById(id), listCategories(), listLocations()]);
  if (!item) {
    notFound();
  }

  return (
    <AppShell user={user} title={`Edit Item - ${item.name}`} subtitle="Perbarui data item inventaris.">
      <section className="card p-5">
        <form action={updateItemAction.bind(null, item.id)} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Kode Barang</label>
            <input name="itemCode" title="Kode barang" className="input" defaultValue={item.itemCode} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Nama Barang</label>
            <input name="name" title="Nama barang" className="input" defaultValue={item.name} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Kategori</label>
            <select name="categoryId" title="Kategori" className="select" defaultValue={item.categoryId} required>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Lokasi</label>
            <select name="locationId" title="Lokasi" className="select" defaultValue={item.locationId} required>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Total Quantity</label>
            <input type="number" min={0} name="totalQuantity" title="Total quantity" className="input" defaultValue={item.totalQuantity} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Available Quantity</label>
            <input type="number" min={0} name="availableQuantity" title="Available quantity" className="input" defaultValue={item.availableQuantity} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Satuan</label>
            <input name="unit" title="Satuan" className="input" defaultValue={item.unit} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Kondisi</label>
            <select name="condition" title="Kondisi" className="select" defaultValue={item.condition}>
              {itemConditions.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Status</label>
            <select name="status" title="Status" className="select" defaultValue={item.status}>
              {itemStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Deskripsi</label>
            <textarea name="description" title="Deskripsi" className="textarea" rows={4} defaultValue={item.description} />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn btn-primary">
              Simpan Perubahan
            </button>
            <Link href="/admin/items" className="btn btn-muted">
              Kembali
            </Link>
          </div>
        </form>

        <form action={deleteItemAction.bind(null, item.id)} className="mt-6 border-t border-slate-200 pt-4">
          <button type="submit" className="btn btn-muted text-rose-700">
            Hapus Item
          </button>
        </form>
      </section>
    </AppShell>
  );
}
