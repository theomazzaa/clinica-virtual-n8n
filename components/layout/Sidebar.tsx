"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", Icon: Calendar },
  { href: "/pacientes", label: "Pacientes", Icon: Users },
  { href: "/alarmas", label: "Alertas", Icon: AlertTriangle, badge: true },
  { href: "/configuracion", label: "Configuracion", Icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [alertasCount, setAlertasCount] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nombre =
    (session?.user as { nombre?: string })?.nombre ??
    session?.user?.name ??
    "";
  const apellido =
    (session?.user as { apellido?: string })?.apellido ?? "";
  const fullName = `${nombre} ${apellido}`.trim();

  useEffect(() => {
    fetch("/api/alertas/count")
      .then((r) => r.json())
      .then((d) => setAlertasCount(d.count ?? 0))
      .catch(() => setAlertasCount(0));
  }, []);

  // Cerrar sidebar mobile al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      {/* Logo — clickable → dashboard */}
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-6 py-5 border-b border-border group focus-ring"
      >
        <img
          src="/logo_docagent.png"
          alt="DocAgent"
          className="w-9 h-9 object-contain mix-blend-multiply flex-shrink-0"
        />
        <span className="text-lg font-bold text-text-primary group-hover:text-primary-600 transition-colors">
          DocAgent
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-150 focus-ring",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
              )}
            >
              {/* Barra lateral azul activa */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-primary-600 rounded-r-full" />
              )}

              <item.Icon
                className={cn(
                  "w-[18px] h-[18px] flex-shrink-0",
                  isActive ? "text-primary-600" : ""
                )}
              />
              <span className="flex-1">{item.label}</span>

              {item.badge && alertasCount !== null && alertasCount > 0 && (
                <span className="bg-danger-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none">
                  {alertasCount > 99 ? "99+" : alertasCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: doctor info + logout */}
      {session?.user && (
        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-3 px-1">
            <Avatar name={fullName || "Doctor"} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">
                Dr. {fullName}
              </p>
              <p className="text-[11px] text-text-muted truncate leading-none mt-0.5">
                {session.user.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Cerrar sesion"
              aria-label="Cerrar sesion"
              className="p-1.5 text-text-muted hover:text-danger-600 rounded-[var(--radius-sm)] transition-colors focus-ring flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors focus-ring rounded-[var(--radius-sm)]"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 focus-ring rounded-[var(--radius-sm)]">
          <img
            src="/logo_docagent.png"
            alt="DocAgent"
            className="w-7 h-7 object-contain mix-blend-multiply"
          />
          <span className="font-bold text-text-primary text-sm">DocAgent</span>
        </Link>
        <div className="w-9" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 animate-[fadeIn_150ms_ease-in-out]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-in) */}
      <aside
        className={cn(
          "md:hidden fixed left-0 top-0 h-full w-72 bg-surface border-r border-border flex flex-col z-50 transform transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 text-text-muted hover:text-text-primary rounded-[var(--radius-sm)] transition-colors focus-ring"
          aria-label="Cerrar menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-surface border-r border-border flex-col z-10">
        {sidebarContent}
      </aside>
    </>
  );
}
