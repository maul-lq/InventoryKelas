import { requireUser } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";
import { getDashboardSummary } from "@/lib/store";

export async function GET() {
  try {
    await requireUser(["admin"]);
    return ok(await getDashboardSummary());
  } catch (error) {
    return handleError(error);
  }
}
