import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/page-auth";
import { createDamageReport, getItemById } from "@/lib/store";

interface DamageReportPageProps {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ error?: string }>;
}

async function submitDamageAction(itemId: string, formData: FormData) {
  "use server";

  const user = await requirePageUser();

  try {
    await createDamageReport({
      actorUserId: user.id,
      itemId,
      userId: user.id,
      issueType: String(formData.get("issueType") ?? ""),
      description: String(formData.get("description") ?? ""),
    });

    revalidatePath("/my-damage-reports");
    redirect("/my-damage-reports");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat laporan.";
    redirect(`/damage-report/${itemId}?error=${encodeURIComponent(message)}`);
  }
}

export default async function DamageReportPage({ params, searchParams }: DamageReportPageProps) {
  const user = await requirePageUser();
  const { itemId } = await params;
  const query = await searchParams;

  const item = await getItemById(itemId);
  if (!item) {
    redirect("/inventory");
  }

  return (
    <AppShell user={user} title={`Laporan Kerusakan - ${item.name}`} subtitle="Laporkan barang rusak, hilang, atau tidak layak pakai.">
      <section className="card p-5">
        {query.error ? <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{query.error}</p> : null}

        <form action={submitDamageAction.bind(null, item.id)} className="grid gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Jenis Masalah</label>
            <select name="issueType" className="select" required>
              <option value="">Pilih jenis masalah</option>
              <option value="rusak-ringan">Rusak ringan</option>
              <option value="rusak-berat">Rusak berat</option>
              <option value="hilang">Hilang</option>
              <option value="tidak-layak-pakai">Tidak layak pakai</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Deskripsi</label>
            <textarea name="description" className="textarea" rows={4} required />
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              Kirim Laporan
            </button>
            <Link href="/inventory" className="btn btn-muted">
              Batal
            </Link>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
