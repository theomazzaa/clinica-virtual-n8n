import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar />
      <main className="flex-1 md:ml-64 pt-18 md:pt-0">
        <div className="max-w-[1400px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
