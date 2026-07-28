import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/userStore";
import { safeReturnTo } from "@/lib/oauth";
import CompleteProfileForm from "./CompleteProfileForm";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const { returnTo } = await searchParams;
  const destination = safeReturnTo(returnTo ?? null) || "/my-bookings";

  if (session.role !== "customer") {
    redirect(destination);
  }

  const user = await findUserById(session.userId);
  if (!user) {
    redirect("/login");
  }
  if (user.dob && user.phone) {
    redirect(destination);
  }

  return <CompleteProfileForm returnTo={destination} />;
}
