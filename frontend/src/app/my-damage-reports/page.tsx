import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { formatDate } from "@/lib/format";
import { requirePageUser } from "@/lib/page-auth";
import { listDamageReports, listItems } from "@/lib/store";
import { type DamageStatus } from "@/lib/types";

function toneByDamageStatus(status: DamageStatus): "neutral" | "success" | "warning" | "danger" {
  if (status === "selesai") {
    return "success";
  }
  if (status === "baru" || status === "ditinjau") {
    return "warning";
  }
  if (status === "diproses") {
    return "neutral";
  }
  return "danger";
}

export default async function MyDamageReportsPage() {
  const user = await requirePageUser();

  const [rows, items] = await Promise.all([
    listDamageReports({ userId: user.id }),
    listItems(),
  ]);

  return (
    <AppShell user={user} title="Riwayat Laporan Kerusakan" subtitle="Pantau laporan kerusakan yang pernah kamu kirim.">
      <section className="card p-4">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Jenis Masalah</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>Follow Up</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const item = items.find((entry) => entry.id === row.itemId);
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{item?.name ?? "Item dihapus"}</td>
                    <td>{row.issueType}</td>
                    <td>{row.description}</td>
                    <td>
                      <StatusPill text={row.status} tone={toneByDamageStatus(row.status)} />
                    </td>
                    <td>
                      <p>{row.followUpNote || "-"}</p>
                      {row.handledAt ? <p className="text-xs text-slate-500">Update: {formatDate(row.handledAt)}</p> : null}
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
