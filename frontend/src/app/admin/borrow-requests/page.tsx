import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { formatDate, formatDateOnly } from "@/lib/format";
import { borrowStatuses } from "@/lib/options";
import { requirePageUser } from "@/lib/page-auth";
import { listBorrowRequests, listItems, listUsers, updateBorrowRequestStatus } from "@/lib/store";

async function updateBorrowStatusAction(requestId: string, formData: FormData) {
  "use server";
  const admin = await requirePageUser(["admin"]);

  await updateBorrowRequestStatus(requestId, {
    actorUserId: admin.id,
    status: String(formData.get("status") ?? "menunggu") as never,
    adminNote: String(formData.get("adminNote") ?? ""),
  });

  revalidatePath("/admin/borrow-requests");
  revalidatePath("/my-borrow-requests");
  revalidatePath("/inventory");
}

export default async function AdminBorrowRequestsPage() {
  const user = await requirePageUser(["admin"]);

  const [rows, items, users] = await Promise.all([
    listBorrowRequests(),
    listItems(),
    listUsers(),
  ]);

  return (
    <AppShell user={user} title="Approval Peminjaman" subtitle="Proses approve, reject, atau selesai untuk setiap pengajuan.">
      <section className="card p-4">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Peminjam</th>
                <th>Item</th>
                <th>Detail</th>
                <th>Status</th>
                <th>Aksi Admin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const item = items.find((entry) => entry.id === row.itemId);
                const borrower = users.find((entry) => entry.id === row.userId);

                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <p className="font-semibold text-slate-800">{borrower?.name ?? row.userId}</p>
                      <p className="text-xs text-slate-500">{borrower?.email ?? "-"}</p>
                    </td>
                    <td>{item?.name ?? "Item dihapus"}</td>
                    <td>
                      <p>Qty: {row.quantity}</p>
                      <p>Tujuan: {row.purpose}</p>
                      <p>Pinjam: {formatDateOnly(row.borrowDate)}</p>
                      <p>Kembali: {formatDateOnly(row.expectedReturnDate)}</p>
                    </td>
                    <td>
                      <StatusPill text={row.status} />
                      {row.approvedAt ? <p className="mt-1 text-xs text-slate-500">{formatDate(row.approvedAt)}</p> : null}
                    </td>
                    <td>
                      <form action={updateBorrowStatusAction.bind(null, row.id)} className="space-y-2">
                        <select name="status" defaultValue={row.status} className="select">
                          {borrowStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <textarea
                          name="adminNote"
                          className="textarea"
                          defaultValue={row.adminNote}
                          placeholder="Catatan keputusan admin"
                          rows={2}
                        />
                        <button type="submit" className="btn btn-primary w-full">
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>Belum ada pengajuan peminjaman.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
