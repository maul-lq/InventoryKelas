import { requireUser } from "@/lib/auth";
import { handleError, ok, readJsonBody } from "@/lib/api";
import { parsePositiveInt } from "@/lib/input-parsers";
import { createBorrowRequest, listBorrowRequests } from "@/lib/store";

interface BorrowBody {
  itemId?: string;
  quantity?: number;
  purpose?: string;
  borrowDate?: string;
  expectedReturnDate?: string;
  userNote?: string;
  userId?: string;
}

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status") ?? undefined;
    const userId = user.role === "admin" ? searchParams.get("userId") ?? undefined : user.id;

    const rows = await listBorrowRequests({
      userId,
      status: (status as never) ?? undefined,
    });

    return ok(rows);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireUser();
    const body = await readJsonBody<BorrowBody>(request);

    const targetUserId = actor.role === "admin" ? String(body.userId ?? actor.id) : actor.id;

    const row = await createBorrowRequest({
      actorUserId: actor.id,
      itemId: String(body.itemId ?? ""),
      userId: targetUserId,
      quantity: parsePositiveInt(body.quantity, "Quantity"),
      purpose: String(body.purpose ?? ""),
      borrowDate: String(body.borrowDate ?? ""),
      expectedReturnDate: String(body.expectedReturnDate ?? ""),
      userNote: String(body.userNote ?? ""),
    });

    return ok(row, 201);
  } catch (error) {
    return handleError(error);
  }
}
