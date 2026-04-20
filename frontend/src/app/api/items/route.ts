import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { parseItemInput } from "@/lib/input-parsers";
import { createItem, listItems } from "@/lib/store";

export async function GET(request: Request) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);

    const items = await listItems({
      categoryId: searchParams.get("categoryId") ?? undefined,
      locationId: searchParams.get("locationId") ?? undefined,
      status: (searchParams.get("status") as never) ?? undefined,
      keyword: searchParams.get("q") ?? undefined,
    });

    return ok(items);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(["admin"]);
    const body = await readJsonBody<Record<string, unknown>>(request);
    const parsed = parseItemInput(body);

    const item = await createItem({
      actorUserId: user.id,
      ...parsed,
    });

    return ok(item, 201);
  } catch (error) {
    return handleError(error);
  }
}
