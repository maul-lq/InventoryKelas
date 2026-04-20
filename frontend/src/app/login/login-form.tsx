"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@pnj.ac.id");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Login gagal.");
      }

      router.replace("/");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-md p-6">
      <h1 className="text-2xl font-bold text-slate-900">Masuk ke Inventra PNJ</h1>
      <p className="mt-2 text-sm text-slate-600">Gunakan akun seed untuk mulai uji fitur MVP.</p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p> : null}

      <button type="submit" disabled={loading} className="btn btn-primary mt-5 w-full">
        {loading ? "Memproses..." : "Login"}
      </button>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        <p className="font-semibold">Akun seed:</p>
        <p>Admin: admin@pnj.ac.id / admin123</p>
        <p>Mahasiswa: mhs@pnj.ac.id / mhs123</p>
      </div>
    </form>
  );
}
