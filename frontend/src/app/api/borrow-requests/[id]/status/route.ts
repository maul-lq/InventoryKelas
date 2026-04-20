import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { parseBorrowStatus } from "@/lib/input-parsers";
import { updateBorrowRequestStatus } from "@/lib/store";

interface BorrowStatusBody {
  status?: string;
  adminNote?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(["admin"]);
    const { id } = await context.params;
    const body = await readJsonBody<BorrowStatusBody>(request);

    const row = await updateBorrowRequestStatus(id, {
      actorUserId: user.id,
      status: parseBorrowStatus(body.status),
      adminNote: String(body.adminNote ?? ""),
    });

    return ok(row);
  } catch (error) {
    return handleError(error);
  }
}
