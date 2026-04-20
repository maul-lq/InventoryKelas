import Link from "next/link";
import { logoutCurrentSession, type PublicUser } from "@/lib/auth";

interface AppShellProps {
  user: PublicUser;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

async function logoutAction() {
  "use server";
  await logoutCurrentSession();
}

function buildLinks(role: PublicUser["role"]) {
  const common = [
    { href: "/inventory", label: "Inventaris" },
    { href: "/my-borrow-requests", label: "Peminjaman Saya" },
    { href: "/my-damage-reports", label: "Laporan Saya" },
  ];

  if (role === "admin") {
    return [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/items", label: "Manajemen Item" },
      { href: "/admin/categories", label: "Kategori" },
      { href: "/admin/locations", label: "Lokasi" },
      { href: "/admin/borrow-requests", label: "Approval Peminjaman" },
      { href: "/admin/damage-reports", label: "Laporan Kerusakan" },
      ...common,
    ];
  }

  return common;
}

export function AppShell({ user, title, subtitle, children }: AppShellProps) {
  const links = buildLinks(user.role);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff4da,_#f5f7fb_40%,_#eef1f8_100%)] text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Inventra PNJ</p>
            <p className="text-sm text-slate-600">
              Login sebagai {user.name} ({user.role})
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Logout
            </button>
          </form>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl flex-wrap gap-2 px-4 pb-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:text-amber-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}
        </section>

        {children}
      </main>
    </div>
  );
}
