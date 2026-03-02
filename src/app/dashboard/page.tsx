import DashboardClientPage from "./client";
import { getSession } from "auth";
import { redirect } from "next/navigation";
import { getUserForms } from "@/db/storage";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const allForms = await getUserForms(session?.user?.id as string);
  const { error } = await searchParams;

  return <DashboardClientPage forms={allForms} error={error} />;
}
