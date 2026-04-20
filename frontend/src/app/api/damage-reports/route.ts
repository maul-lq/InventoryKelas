import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { createDamageReport, listDamageReports } from "@/lib/store";

interface DamageBody {
  itemId?: string;
  issueType?: string;
  description?: string;
  userId?: string;
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") ?? undefined;
    const userId = user.role === "admin" ? searchParams.get("userId") ?? undefined : user.id;

    const rows = await listDamageReports({
      userId,
      status: (status as never) ?? undefined,
    });

    return ok(rows);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    const body = await readJsonBody<DamageBody>(request);

    const targetUserId = actor.role === "admin" ? String(body.userId ?? actor.id) : actor.id;

    const row = await createDamageReport({
      actorUserId: actor.id,
      itemId: String(body.itemId ?? ""),
      userId: targetUserId,
      issueType: String(body.issueType ?? ""),
      description: String(body.description ?? ""),
    });

    return ok(row, 201);
  } catch (error) {
    return handleError(error);
  }
}
