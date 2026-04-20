import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { createLocation, listLocations } from "@/lib/store";

interface LocationBody {
  name?: string;
  description?: string;
}

export async function GET() {
  try {
    await requireUser();
    return ok(await listLocations());
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(["admin"]);
    const body = await readJsonBody<LocationBody>(request);

    const location = await createLocation({
      actorUserId: user.id,
      name: String(body.name ?? ""),
      description: String(body.description ?? ""),
    });

    return ok(location, 201);
  } catch (error) {
    return handleError(error);
  }
}
