import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, selectClass } from "@/components/AppShell";
import { can, type Patient, type Staff } from "@/lib/clinic";
import { useAddPatient, useDb, useDeletePatient } from "@/lib/clinic-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patients — DentCare" },
      { name: "description", content: "Search and manage your clinic's patient records." },
      { property: "og:title", content: "Patients — DentCare" },
      { property: "og:description", content: "Search and manage your clinic's patient records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell title="Patients">{(me) => <Patients me={me} />}</AppShell>,
});

function age(dob: string) {
  const d = new Date(dob);
  return Math.floor((Date.now() - d.getTime()) / 3.15576e10);
}

function Patients({ me }: { me: Staff }) {
  const db = useDb();
  const deletePatient = useDeletePatient();
  const [q, setQ] = useState("");
  const canWrite = can(me.role, "patients:write");
  const list = db.patients.filter(
    (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.phone.includes(q),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or phone" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        {canWrite && <AddPatient />}
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Age</th>
              <th className="px-4 py-3 font-medium">Medical alerts</th>
              <th className="px-4 py-3 font-medium">Visits</th>
              {canWrite && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-foreground">{p.name}<div className="text-xs font-normal text-muted-foreground">{p.gender}</div></td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{age(p.dob)}</td>
                <td className="px-4 py-3">
                  {p.alerts ? (
                    <span className="inline-flex items-center gap-1 text-destructive"><AlertTriangle className="h-3.5 w-3.5" />{p.alerts}</span>
                  ) : <span className="text-muted-foreground">None</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{db.appointments.filter((a) => a.patientId === p.id).length}</td>
                {canWrite && (
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => {
                        if (!confirm(`Delete ${p.name} and their appointments?`)) return;
                        deletePatient.mutate(p.id, { onSuccess: () => toast.success("Patient deleted") });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No patients found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AddPatient() {
  const addPatient = useAddPatient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", dob: "", gender: "Female" as Patient["gender"], alerts: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" />Add patient</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New patient</DialogTitle></DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            addPatient.mutate(
              { ...form, name: form.name.trim() },
              {
                onSuccess: () => {
                  toast.success("Patient added");
                  setForm({ name: "", phone: "", dob: "", gender: "Female", alerts: "" });
                  setOpen(false);
                },
              },
            );
          }}
        >
          <div className="space-y-1"><Label>Full name</Label><Input required value={form.name} onChange={set("name")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Phone</Label><Input required value={form.phone} onChange={set("phone")} /></div>
            <div className="space-y-1"><Label>Date of birth</Label><Input required type="date" value={form.dob} onChange={set("dob")} /></div>
          </div>
          <div className="space-y-1">
            <Label>Gender</Label>
            <select className={selectClass} value={form.gender} onChange={set("gender")}>
              <option>Female</option><option>Male</option><option>Other</option>
            </select>
          </div>
          <div className="space-y-1"><Label>Medical alerts</Label><Input placeholder="Allergies, conditions…" value={form.alerts} onChange={set("alerts")} /></div>
          <Button type="submit" className="w-full">Save patient</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
