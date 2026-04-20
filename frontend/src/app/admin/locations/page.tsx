import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/page-auth";
import { createLocation, deleteLocation, listLocations, updateLocation } from "@/lib/store";

async function createLocationAction(formData: FormData) {
  "use server";
  const admin = await requirePageUser(["admin"]);

  await createLocation({
    actorUserId: admin.id,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  revalidatePath("/admin/locations");
}

async function updateLocationAction(locationId: string, formData: FormData) {
  "use server";
  const admin = await requirePageUser(["admin"]);

  await updateLocation(locationId, {
    actorUserId: admin.id,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  });

  revalidatePath("/admin/locations");
}

async function deleteLocationAction(locationId: string) {
  "use server";
  const admin = await requirePageUser(["admin"]);
  await deleteLocation(locationId, admin.id);
  revalidatePath("/admin/locations");
}

export default async function AdminLocationsPage() {
  const user = await requirePageUser(["admin"]);
  const locations = await listLocations();

  return (
    <AppShell user={user} title="Manajemen Lokasi" subtitle="Kelola data ruang, kelas, dan lokasi inventaris.">
      <section className="card mb-6 p-4">
        <h2 className="mb-3 text-lg font-bold text-slate-900">Tambah Lokasi</h2>
        <form action={createLocationAction} className="grid gap-3 md:grid-cols-3">
          <input name="name" className="input" placeholder="Nama lokasi" required />
          <input name="description" className="input" placeholder="Deskripsi lokasi" />
          <button type="submit" className="btn btn-primary">
            Simpan
          </button>
        </form>
      </section>

      <section className="card p-4">
        <div className="space-y-3">
          {locations.map((location) => (
            <div key={location.id} className="rounded-xl border border-slate-200 p-3">
              <form action={updateLocationAction.bind(null, location.id)} className="grid gap-3 md:grid-cols-3">
                <input name="name" className="input" defaultValue={location.name} required />
                <input name="description" className="input" defaultValue={location.description} />
                <div className="flex gap-2">
                  <button type="submit" className="btn btn-muted">
                    Update
                  </button>
                  <button type="submit" formAction={deleteLocationAction.bind(null, location.id)} className="btn btn-muted text-rose-700">
                    Hapus
                  </button>
                </div>
              </form>
            </div>
          ))}
          {locations.length === 0 ? <p className="text-sm text-slate-600">Belum ada lokasi.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
