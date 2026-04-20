import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("Body JSON tidak valid.");
  }
}

export function handleError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return fail("Unauthorized", 401);
    }
    if (error.message === "FORBIDDEN") {
      return fail("Forbidden", 403);
    }
    return fail(error.message, 400);
  }
  return fail("Terjadi kesalahan pada server.", 500);
}
