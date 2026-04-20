import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { formatDate, formatDateOnly } from "@/lib/format";
import { requirePageUser } from "@/lib/page-auth";
import { listBorrowRequests, listItems } from "@/lib/store";
import { type BorrowStatus } from "@/lib/types";

function toneByBorrowStatus(status: BorrowStatus): "neutral" | "success" | "warning" | "danger" {
  if (status === "disetujui" || status === "selesai") {
    return "success";
  }
  if (status === "menunggu") {
    return "warning";
  }
  if (status === "ditolak") {
    return "danger";
  }
  return "neutral";
}

export default async function MyBorrowRequestsPage() {
  const user = await requirePageUser();

  const [rows, items] = await Promise.all([
    listBorrowRequests({ userId: user.id }),
    listItems(),
  ]);

  return (
    <AppShell user={user} title="Riwayat Peminjaman Saya" subtitle="Seluruh pengajuan pinjam beserta status approval admin.">
      <section className="card p-4">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Tujuan</th>
                <th>Tanggal Pinjam</th>
                <th>Rencana Kembali</th>
                <th>Status</th>
                <th>Catatan Admin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const item = items.find((entry) => entry.id === row.itemId);
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{item?.name ?? "Item dihapus"}</td>
                    <td>{row.quantity}</td>
                    <td>{row.purpose}</td>
                    <td>{formatDateOnly(row.borrowDate)}</td>
                    <td>{formatDateOnly(row.expectedReturnDate)}</td>
                    <td>
                      <StatusPill text={row.status} tone={toneByBorrowStatus(row.status)} />
                    </td>
                    <td>
                      <p>{row.adminNote || "-"}</p>
                      {row.approvedAt ? <p className="text-xs text-slate-500">Diproses: {formatDate(row.approvedAt)}</p> : null}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>Belum ada pengajuan peminjaman.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
