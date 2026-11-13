import { notFound, redirect } from "next/navigation";
import { getLocalAdminAccess } from "@/lib/supabase/local-admin";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const access = await getLocalAdminAccess();
  if (access.status === 401) redirect("/admin/login");
  if (access.status !== 200) notFound();
  return <AdminDashboard />;
}
