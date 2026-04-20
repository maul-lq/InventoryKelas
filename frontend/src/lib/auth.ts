import { cookies } from "next/headers";
import { type Role, type User } from "@/lib/types";
import { createSession, deleteSession, getSession, getUserByEmail, getUserById } from "@/lib/store";

export const SESSION_COOKIE_NAME = "inventra_session";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await getSession(token);
  if (!session) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const user = await getUserById(session.userId);
  if (!user) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  return toPublicUser(user);
}

export async function loginWithEmailPassword(email: string, password: string): Promise<PublicUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Email dan password wajib diisi.");
  }

  const user = await getUserByEmail(normalizedEmail);
  if (!user || user.password !== normalizedPassword) {
    throw new Error("Kredensial tidak valid.");
  }

  const session = await createSession(user.id);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return toPublicUser(user);
}

export async function logoutCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = await getCurrentUser();

  if (token) {
    await deleteSession(token, user?.id ?? null);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function requireUser(allowedRoles?: Role[]): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
