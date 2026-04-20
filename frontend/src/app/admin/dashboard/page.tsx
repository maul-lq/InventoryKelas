import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { formatDate } from "@/lib/format";
import { requirePageUser } from "@/lib/page-auth";
import { getDashboardSummary, listActivityLogs, listUsers } from "@/lib/store";

export default async function AdminDashboardPage() {
  const user = await requirePageUser(["admin"]);

  const [summary, activities, users] = await Promise.all([
    getDashboardSummary(),
    listActivityLogs(15),
    listUsers(),
  ]);

  return (
    <AppShell user={user} title="Dashboard Admin" subtitle="Ringkasan status inventaris dan aktivitas terbaru.">
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="card p-4">
          <p className="text-sm text-slate-500">Total Barang</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{summary.totalItems}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-slate-500">Barang Tersedia</p>
          <p className="mt-1 text-3xl font-black text-emerald-700">{summary.totalAvailableItems}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-slate-500">Sedang Dipinjam</p>
          <p className="mt-1 text-3xl font-black text-amber-700">{summary.totalBorrowedItems}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-slate-500">Barang Rusak</p>
          <p className="mt-1 text-3xl font-black text-rose-700">{summary.totalBrokenItems}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-slate-500">Barang Habis</p>
          <p className="mt-1 text-3xl font-black text-slate-900">{summary.totalOutOfStockItems}</p>
        </article>
        <article className="card p-4">
          <p className="text-sm text-slate-500">Menunggu Approval</p>
          <p className="mt-1 text-3xl font-black text-amber-700">{summary.pendingBorrowRequests}</p>
          <Link href="/admin/borrow-requests" className="mt-2 inline-block text-sm font-semibold text-amber-700">
            Buka modul approval
          </Link>
        </article>
        <article className="card p-4">
          <p className="text-sm text-slate-500">Laporan Aktif</p>
          <p className="mt-1 text-3xl font-black text-amber-700">{summary.activeDamageReports}</p>
          <Link href="/admin/damage-reports" className="mt-2 inline-block text-sm font-semibold text-amber-700">
            Buka modul kerusakan
          </Link>
        </article>
      </section>

      <section className="card mt-6 p-4">
        <h2 className="text-lg font-bold text-slate-900">Aktivitas Terbaru</h2>
        <div className="mt-3 space-y-2">
          {activities.map((activity) => {
            const actor = activity.actorUserId ? users.find((entry) => entry.id === activity.actorUserId) : null;
            return (
              <div key={activity.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{activity.message}</p>
                <p className="text-xs text-slate-500">
                  Actor: {actor?.name ?? "System"} | {formatDate(activity.createdAt)}
                </p>
              </div>
            );
          })}
          {activities.length === 0 ? <p className="text-sm text-slate-600">Belum ada aktivitas.</p> : null}
        </div>
      </section>
    </AppShell>
  );
}
