import { redirect } from "next/navigation";
import { getCurrentUser, listUsers } from "@/lib/auth";
import PageHead from "../../components/PageHead";
import TeamManager from "./TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");

  const users = await listUsers();

  return (
    <>
      <PageHead eyebrow="ACCESS" title="Team" />
      <TeamManager users={users} currentUser={currentUser} />
    </>
  );
}
