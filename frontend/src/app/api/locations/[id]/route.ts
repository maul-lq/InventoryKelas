import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { deleteLocation, updateLocation } from "@/lib/store";

interface LocationBody {
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
    const body = await readJsonBody<LocationBody>(request);

    const location = await updateLocation(id, {
      actorUserId: user.id,
      name: String(body.name ?? ""),
      description: String(body.description ?? ""),
    });

    return ok(location);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireUser(["admin"]);
    const { id } = await context.params;
    await deleteLocation(id, user.id);
    return ok({ message: "Lokasi berhasil dihapus." });
  } catch (error) {
    return handleError(error);
  }
}
