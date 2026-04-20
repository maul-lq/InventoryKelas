import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";
import { getBorrowRequestById } from "@/lib/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser();
    const { id } = await context.params;
    const row = await getBorrowRequestById(id);

    if (!row) {
      throw new Error("Pengajuan tidak ditemukan.");
    }

    if (user.role !== "admin" && row.userId !== user.id) {
      throw new Error("FORBIDDEN");
    }

    return ok(row);
  } catch (error) {
    return handleError(error);
  }
}
