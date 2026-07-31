import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  findUserById,
  withUsersTransaction,
  SUPER_ADMIN_EMAIL,
} from "@/lib/userStore";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/admin/admins/[id]">) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const currentAdmin = await findUserById(session.userId);
  if (!currentAdmin || currentAdmin.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json(
      { error: "Only the primary admin account can remove admin access." },
      { status: 403 }
    );
  }

  const { id } = await ctx.params;

  const outcome = await withUsersTransaction<null>((users) => {
    const target = users.find((u) => u.id === id);
    if (!target || target.role !== "admin") {
      return { error: "Admin account not found." };
    }
    if (target.email === SUPER_ADMIN_EMAIL) {
      return { error: "Cannot remove the primary admin account." };
    }
    return { users: users.filter((u) => u.id !== id), result: null };
  });

  if ("error" in outcome) {
    const status =
      outcome.error === "Admin account not found."
        ? 404
        : outcome.error === "Cannot remove the primary admin account."
          ? 403
          : 409;
    return NextResponse.json({ error: outcome.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
