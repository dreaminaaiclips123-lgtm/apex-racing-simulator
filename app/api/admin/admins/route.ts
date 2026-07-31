import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findUserById, readUsers, SUPER_ADMIN_EMAIL } from "@/lib/userStore";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const currentAdmin = await findUserById(session.userId);
  if (!currentAdmin || currentAdmin.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json(
      { error: "Only the primary admin account can view admin access." },
      { status: 403 }
    );
  }

  const users = await readUsers();
  const admins = users
    .filter((u) => u.role === "admin")
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      isSuperAdmin: u.email === SUPER_ADMIN_EMAIL,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return NextResponse.json({ admins });
}
