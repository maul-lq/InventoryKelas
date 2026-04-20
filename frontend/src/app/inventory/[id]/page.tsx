import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { requirePageUser } from "@/lib/page-auth";
import { getItemById, listCategories, listLocations } from "@/lib/store";

interface ItemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const user = await requirePageUser();
  const { id } = await params;

  const [item, categories, locations] = await Promise.all([getItemById(id), listCategories(), listLocations()]);

  if (!item) {
    notFound();
  }

  const category = categories.find((row) => row.id === item.categoryId);
  const location = locations.find((row) => row.id === item.locationId);

  return (
    <AppShell user={user} title={`Detail Item - ${item.name}`} subtitle="Informasi lengkap item inventaris.">
      <section className="card p-5">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-slate-600">Kode Barang</dt>
            <dd className="text-base font-bold text-slate-900">{item.itemCode}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">Status</dt>
            <dd>
              <StatusPill text={item.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">Kategori</dt>
            <dd>{category?.name ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">Lokasi</dt>
            <dd>{location?.name ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">Kondisi</dt>
            <dd>{item.condition}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-slate-600">Stok</dt>
            <dd>
              {item.availableQuantity}/{item.totalQuantity} {item.unit}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-sm font-semibold text-slate-600">Deskripsi</dt>
            <dd>{item.description || "Tidak ada deskripsi."}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/inventory" className="btn btn-muted">
            Kembali
          </Link>
          <Link href={`/borrow/${item.id}`} className="btn btn-primary">
            Ajukan Pinjam
          </Link>
          <Link href={`/damage-report/${item.id}`} className="btn btn-muted">
            Lapor Kerusakan
          </Link>
          {user.role === "admin" ? (
            <Link href={`/admin/items/${item.id}`} className="btn btn-muted">
              Edit Admin
            </Link>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
