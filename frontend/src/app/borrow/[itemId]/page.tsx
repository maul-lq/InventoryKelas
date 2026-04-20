import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/page-auth";
import { createBorrowRequest, getItemById } from "@/lib/store";

interface BorrowPageProps {
  params: Promise<{ itemId: string }>;
  searchParams: Promise<{ error?: string }>;
}

async function submitBorrowAction(itemId: string, formData: FormData) {
  "use server";

  const user = await requirePageUser();

  try {
    await createBorrowRequest({
      actorUserId: user.id,
      itemId,
      userId: user.id,
      quantity: Number(formData.get("quantity") ?? 0),
      purpose: String(formData.get("purpose") ?? ""),
      borrowDate: String(formData.get("borrowDate") ?? ""),
      expectedReturnDate: String(formData.get("expectedReturnDate") ?? ""),
      userNote: String(formData.get("userNote") ?? ""),
    });

    revalidatePath("/inventory");
    revalidatePath("/my-borrow-requests");
    redirect("/my-borrow-requests");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal membuat pengajuan.";
    redirect(`/borrow/${itemId}?error=${encodeURIComponent(message)}`);
  }
}

export default async function BorrowItemPage({ params, searchParams }: BorrowPageProps) {
  const user = await requirePageUser();
  const { itemId } = await params;
  const query = await searchParams;

  const item = await getItemById(itemId);
  if (!item) {
    redirect("/inventory");
  }

  return (
    <AppShell user={user} title={`Ajukan Peminjaman - ${item.name}`} subtitle="Isi data peminjaman untuk dikirim ke admin.">
      <section className="card p-5">
        {query.error ? <p className="mb-3 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{query.error}</p> : null}

        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p>Stok tersedia: {item.availableQuantity}</p>
          <p>Status item: {item.status}</p>
        </div>

        <form action={submitBorrowAction.bind(null, item.id)} className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Jumlah</label>
            <input type="number" min={1} max={item.availableQuantity} name="quantity" title="Jumlah pinjam" className="input" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Tujuan</label>
            <input name="purpose" title="Tujuan peminjaman" className="input" placeholder="Contoh: praktikum basis data" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Tanggal Pinjam</label>
            <input type="date" name="borrowDate" title="Tanggal pinjam" className="input" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Rencana Kembali</label>
            <input type="date" name="expectedReturnDate" title="Tanggal rencana kembali" className="input" required />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Catatan Tambahan</label>
            <textarea name="userNote" title="Catatan tambahan" className="textarea" rows={3} />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn btn-primary">
              Kirim Pengajuan
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
