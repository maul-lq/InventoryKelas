import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { parseItemInput } from "@/lib/input-parsers";
import { deleteItem, getItemById, updateItem } from "@/lib/store";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireUser();
    const { id } = await context.params;
    const item = await getItemById(id);

    if (!item) {
      throw new Error("Item tidak ditemukan.");
    }

    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(["admin"]);
    const { id } = await context.params;
    const body = await readJsonBody<Record<string, unknown>>(request);
    const parsed = parseItemInput(body);

    const item = await updateItem(id, {
      actorUserId: user.id,
      ...parsed,
    });

    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser(["admin"]);
    const { id } = await context.params;
    await deleteItem(id, user.id);
    return ok({ message: "Item berhasil dihapus." });
  } catch (error) {
    return handleError(error);
  }
}
