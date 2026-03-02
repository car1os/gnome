import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";

export default async function Home() {
  const session = await getSession();

  if (!session.accessToken) {
    redirect("/login");
  }

  return <DashboardShell firstName={session.firstName} />;
}
