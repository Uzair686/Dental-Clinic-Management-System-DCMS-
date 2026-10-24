import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, selectClass } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { can, isoDate, STATUSES, type ApptStatus, type Staff } from "@/lib/clinic";
import { useAddAppointment, useDb, useSetAppointmentStatus } from "@/lib/clinic-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — DentCare" },
      { name: "description", content: "Book and track dental appointments by day." },
      { property: "og:title", content: "Appointments — DentCare" },
      { property: "og:description", content: "Book and track dental appointments by day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell title="Appointments">{(me) => <Appointments me={me} />}</AppShell>,
});

function shift(date: string, days: number) {
  const d = new Date(date + "T00:00");
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function Appointments({ me }: { me: Staff }) {
  const db = useDb();
  const setStatus = useSetAppointmentStatus();
  const [date, setDate] = useState(isoDate(new Date()));
  const [mine, setMine] = useState(me.role === "dentist");
  const list = db.appointments
    .filter((a) => a.date === date && (!mine || a.dentistId === me.id))
    .sort((a, b) => a.time.localeCompare(b.time));
  const name = (id: string, l: { id: string; name: string }[]) => l.find((x) => x.id === id)?.name ?? "—";
  const pretty = new Date(date + "T00:00").toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Previous day" onClick={() => setDate(shift(date, -1))}><ChevronLeft className="h-4 w-4" /></Button>
        <Input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="w-auto" />
        <Button variant="outline" size="icon" aria-label="Next day" onClick={() => setDate(shift(date, 1))}><ChevronRight className="h-4 w-4" /></Button>
        <Button variant="ghost" onClick={() => setDate(isoDate(new Date()))}>Today</Button>
        {me.role === "dentist" && (
          <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Only my patients
          </label>
        )}
        <div className="ml-auto">{can(me.role, "appointments:write") && <BookAppointment date={date} />}</div>
      </div>
      <Card className="p-5">
        <h2 className="mb-3 font-display text-xl text-foreground">{pretty}</h2>
        {list.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No appointments on this day.</p>
        ) : (
          <ul className="divide-y divide-border">
            {list.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-4 py-3">
                <span className="w-24 font-mono text-sm text-primary">{a.time} · {a.duration}m</span>
                <div className="min-w-40 flex-1">
                  <div className="font-medium text-foreground">{name(a.patientId, db.patients)}</div>
                  <div className="text-sm text-muted-foreground">{a.reason} · {name(a.dentistId, db.staff)}</div>
                </div>
                {can(me.role, "appointments:status") ? (
                  <select
                    aria-label="Status"
                    className={selectClass + " w-36 capitalize"}
                    value={a.status}
                    onChange={(e) => {
                      const status = e.target.value as ApptStatus;
                      setStatus.mutate(
                        { id: a.id, status },
                        { onSuccess: () => toast.success(`Marked ${status.replace("-", " ")}`) },
                      );
                    }}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("-", " ")}</option>)}
                  </select>
                ) : <StatusBadge status={a.status} />}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function BookAppointment({ date }: { date: string }) {
  const db = useDb();
  const addAppointment = useAddAppointment();
  const dentists = db.staff.filter((s) => s.role !== "receptionist");
  const empty = { patientId: "", dentistId: dentists[0]?.id ?? "", date, time: "09:00", duration: 30, reason: "" };
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(empty);

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setF({ ...empty, date }); }}>
      <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" />Book appointment</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Book appointment</DialogTitle></DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            addAppointment.mutate(f, {
              onSuccess: () => {
                toast.success("Appointment booked");
                setOpen(false);
              },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Could not book appointment"),
            });
          }}
        >
          <div className="space-y-1">
            <Label>Patient</Label>
            <select required className={selectClass} value={f.patientId} onChange={(e) => setF({ ...f, patientId: e.target.value })}>
              <option value="">Select patient…</option>
              {db.patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Dentist</Label>
            <select required className={selectClass} value={f.dentistId} onChange={(e) => setF({ ...f, dentistId: e.target.value })}>
              {dentists.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label>Date</Label><Input required type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
            <div className="space-y-1"><Label>Time</Label><Input required type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Length</Label>
              <select className={selectClass} value={f.duration} onChange={(e) => setF({ ...f, duration: Number(e.target.value) })}>
                {[15, 30, 45, 60, 90].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1"><Label>Reason</Label><Input required placeholder="e.g. Check-up, filling" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></div>
          <Button type="submit" className="w-full">Book</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
