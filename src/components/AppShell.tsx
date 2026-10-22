import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { CalendarDays, LayoutDashboard, LogOut, Stethoscope, UserCog, Users } from "lucide-react";
import { can, ROLE_LABEL, type Staff } from "@/lib/clinic";
import { signOut, useSession } from "@/lib/clinic-store";
import { Button } from "@/components/ui/button";

export function AppShell({ title, children }: { title: string; children: (me: Staff) => ReactNode }) {
  const me = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (me === null) navigate({ to: "/", replace: true });
  }, [me, navigate]);

  if (!me) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/patients", label: "Patients", icon: Users },
    { to: "/appointments", label: "Appointments", icon: CalendarDays },
    ...(can(me.role, "staff:manage") ? [{ to: "/staff", label: "Staff", icon: UserCog }] : []),
  ] as const;

  return (
    <div className="min-h-screen bg-muted/40 md:flex">
      <aside className="border-b border-border bg-sidebar md:sticky md:top-0 md:h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="font-display text-xl text-foreground">DentCare</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent font-medium text-sidebar-primary" }}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-background px-6 py-3">
          <h1 className="font-display text-2xl text-foreground">{title}</h1>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-medium text-foreground">{me.name}</div>
              <div className="text-xs text-muted-foreground">{ROLE_LABEL[me.role]}</div>
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Sign out"
              onClick={() => {
                signOut();
                navigate({ to: "/", replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="p-6">{children(me)}</main>
      </div>
    </div>
  );
}

export const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
