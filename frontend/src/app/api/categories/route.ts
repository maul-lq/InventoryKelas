import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { createCategory, listCategories } from "@/lib/store";

interface CategoryBody {
  name?: string;
  description?: string;
}

export async function GET() {
  try {
    await requireUser();
    return ok(await listCategories());
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(["admin"]);
    const body = await readJsonBody<CategoryBody>(request);

    const category = await createCategory({
      actorUserId: user.id,
      name: String(body.name ?? ""),
      description: String(body.description ?? ""),
    });

    return ok(category, 201);
  } catch (error) {
    return handleError(error);
  }
}
