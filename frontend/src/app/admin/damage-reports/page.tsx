import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { damageStatuses, itemConditions, itemStatuses } from "@/lib/options";
import { requirePageUser } from "@/lib/page-auth";
import { listDamageReports, listItems, listUsers, updateDamageReportStatus } from "@/lib/store";

async function updateDamageStatusAction(reportId: string, formData: FormData) {
  "use server";
  const admin = await requirePageUser(["admin"]);

  await updateDamageReportStatus(reportId, {
    actorUserId: admin.id,
    status: String(formData.get("status") ?? "baru") as never,
    followUpNote: String(formData.get("followUpNote") ?? ""),
    itemCondition: String(formData.get("itemCondition") ?? "") as never,
    itemStatus: String(formData.get("itemStatus") ?? "") as never,
  });

  revalidatePath("/admin/damage-reports");
  revalidatePath("/my-damage-reports");
  revalidatePath("/inventory");
}

export default async function AdminDamageReportsPage() {
  const user = await requirePageUser(["admin"]);

  const [rows, items, users] = await Promise.all([
    listDamageReports(),
    listItems(),
    listUsers(),
  ]);

  return (
    <AppShell user={user} title="Manajemen Laporan Kerusakan" subtitle="Review laporan, update tindak lanjut, dan sinkronkan kondisi item.">
      <section className="card p-4">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pelapor</th>
                <th>Item</th>
                <th>Laporan</th>
                <th>Status</th>
                <th>Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const reporter = users.find((entry) => entry.id === row.userId);
                const item = items.find((entry) => entry.id === row.itemId);
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <p className="font-semibold text-slate-800">{reporter?.name ?? row.userId}</p>
                      <p className="text-xs text-slate-500">{reporter?.email ?? "-"}</p>
                    </td>
                    <td>
                      <p className="font-semibold text-slate-800">{item?.name ?? "Item dihapus"}</p>
                      <p className="text-xs text-slate-500">Kondisi: {item?.condition ?? "-"}</p>
                    </td>
                    <td>
                      <p className="font-semibold">{row.issueType}</p>
                      <p>{row.description}</p>
                    </td>
                    <td>
                      <StatusPill text={row.status} />
                    </td>
                    <td>
                      <form action={updateDamageStatusAction.bind(null, row.id)} className="space-y-2">
                        <select name="status" title="Status laporan" defaultValue={row.status} className="select">
                          {damageStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <select name="itemCondition" title="Kondisi item" defaultValue={item?.condition ?? "baik"} className="select">
                          {itemConditions.map((condition) => (
                            <option key={condition} value={condition}>
                              {condition}
                            </option>
                          ))}
                        </select>

                        <select name="itemStatus" title="Status item" defaultValue={item?.status ?? "tersedia"} className="select">
                          {itemStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <textarea
                          name="followUpNote"
                          title="Catatan tindak lanjut"
                          className="textarea"
                          defaultValue={row.followUpNote}
                          placeholder="Catatan tindak lanjut"
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
                  <td colSpan={6}>Belum ada laporan kerusakan.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
