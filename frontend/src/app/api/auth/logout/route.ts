import { logoutCurrentSession } from "@/lib/auth";
import { handleError, ok } from "@/lib/api";

export async function POST() {
  try {
    await logoutCurrentSession();
    return ok({ message: "Logout berhasil." });
  } catch (error) {
    return handleError(error);
  }
}
