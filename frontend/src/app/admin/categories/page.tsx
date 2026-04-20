import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/page-auth";
import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/store";

async function createCategoryAction(formData: FormData) {
  "use server";
  const admin = await requirePageUser(["admin"]);

  await createCategory({
    actorUserId: admin.id,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  revalidatePath("/admin/categories");
}

async function updateCategoryAction(categoryId: string, formData: FormData) {
  "use server";
  const admin = await requirePageUser(["admin"]);

  await updateCategory(categoryId, {
    actorUserId: admin.id,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  revalidatePath("/admin/categories");
}

async function deleteCategoryAction(categoryId: string) {
  "use server";
  const admin = await requirePageUser(["admin"]);
  await deleteCategory(categoryId, admin.id);
  revalidatePath("/admin/categories");
}

export default async function AdminCategoriesPage() {
  const user = await requirePageUser(["admin"]);
  const categories = await listCategories();

  return (
    <AppShell user={user} title="Manajemen Kategori" subtitle="Tambah, edit, dan hapus kategori inventaris.">
      <section className="card mb-6 p-4">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Tambah Kategori</h2>
        <form action={createCategoryAction} className="grid gap-3 md:grid-cols-3">
          <input name="name" className="input" placeholder="Nama kategori" required />
          <input name="description" className="input" placeholder="Deskripsi kategori" />
          <button type="submit" className="btn btn-primary">
            Simpan
          </button>
        </form>
      </section>

      <section className="card p-4">
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="rounded-xl border border-slate-200 p-3">
              <form action={updateCategoryAction.bind(null, category.id)} className="grid gap-3 md:grid-cols-3">
                <input name="name" className="input" defaultValue={category.name} required />
                <input name="description" className="input" defaultValue={category.description} />
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-muted">
                    Update
                  </button>
                  <button type="submit" formAction={deleteCategoryAction.bind(null, category.id)} className="btn btn-muted text-rose-700">
                    Hapus
                  </button>
                </div>
              </form>
            </div>
          ))}
          {categories.length === 0 ? <p className="text-sm text-slate-600">Belum ada kategori.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
