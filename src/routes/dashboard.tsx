import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, CalendarDays, CheckCircle2, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { isoDate } from "@/lib/clinic";
import { useDb } from "@/lib/clinic-store";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DentCare" },
      { name: "description", content: "Today's schedule and clinic overview." },
      { property: "og:title", content: "Dashboard — DentCare" },
      { property: "og:description", content: "Today's schedule and clinic overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell title="Dashboard">{() => <Dashboard />}</AppShell>,
});

function Dashboard() {
  const db = useDb();
  const today = isoDate(new Date());
  const todays = db.appointments.filter((a) => a.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = db.appointments.filter((a) => a.date > today && a.status !== "cancelled").length;
  const done = todays.filter((a) => a.status === "completed").length;
  const name = (id: string, list: { id: string; name: string }[]) => list.find((x) => x.id === id)?.name ?? "—";

  const stats = [
    { label: "Total patients", value: db.patients.length, icon: Users },
    { label: "Today's appointments", value: todays.length, icon: CalendarDays },
    { label: "Completed today", value: done, icon: CheckCircle2 },
    { label: "Upcoming", value: upcoming, icon: CalendarCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Today's schedule</h2>
          <Link to="/appointments" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        {todays.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appointments today.</p>
        ) : (
          <ul className="divide-y divide-border">
            {todays.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 py-3">
                <span className="w-14 font-mono text-sm text-primary">{a.time}</span>
                <div className="min-w-40 flex-1">
                  <div className="font-medium text-foreground">{name(a.patientId, db.patients)}</div>
                  <div className="text-sm text-muted-foreground">{a.reason} · {name(a.dentistId, db.staff)}</div>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
