import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { deleteCategory, updateCategory } from "@/lib/store";

interface CategoryBody {
  name?: string;
  description?: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(["admin"]);
    const { id } = await context.params;
    const body = await readJsonBody<CategoryBody>(request);

    const category = await updateCategory(id, {
      actorUserId: user.id,
      name: String(body.name ?? ""),
      description: String(body.description ?? ""),
    });

    return ok(category);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser(["admin"]);
    const { id } = await context.params;
    await deleteCategory(id, user.id);
    return ok({ message: "Kategori berhasil dihapus." });
  } catch (error) {
    return handleError(error);
  }
}
