import { loginWithEmailPassword } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";

interface LoginBody {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody<LoginBody>(request);
    const user = await loginWithEmailPassword(body.email, body.password);
    return ok(user);
  } catch (error) {
    return handleError(error);
  }
}
