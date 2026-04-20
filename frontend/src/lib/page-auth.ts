import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { type Role } from "@/lib/types";

export async function requirePageUser(allowedRoles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      redirect("/admin/dashboard");
    }
    redirect("/inventory");
  }

  return user;
}
