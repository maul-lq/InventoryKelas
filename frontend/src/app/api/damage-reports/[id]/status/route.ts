import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { parseDamageStatus, parseItemCondition, parseItemStatus } from "@/lib/input-parsers";
import { updateDamageReportStatus } from "@/lib/store";

interface DamageStatusBody {
  status?: string;
  followUpNote?: string;
  itemCondition?: string;
  itemStatus?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(["admin"]);
    const { id } = await context.params;
    const body = await readJsonBody<DamageStatusBody>(request);

    const row = await updateDamageReportStatus(id, {
      actorUserId: user.id,
      status: parseDamageStatus(body.status),
      followUpNote: String(body.followUpNote ?? ""),
      itemCondition: body.itemCondition ? parseItemCondition(body.itemCondition) : undefined,
      itemStatus: body.itemStatus ? parseItemStatus(body.itemStatus) : undefined,
    });

    return ok(row);
  } catch (error) {
    return handleError(error);
  }
}
