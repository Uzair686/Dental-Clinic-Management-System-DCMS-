import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, selectClass } from "@/components/AppShell";
import { can, DEMO_PASSWORD, ROLE_LABEL, type Role, type Staff } from "@/lib/clinic";
import { useAddStaff, useDb, useRemoveStaff, useResetDemo, useSetStaffRole } from "@/lib/clinic-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff & roles — DentCare" },
      { name: "description", content: "Manage clinic staff accounts and their roles." },
      { property: "og:title", content: "Staff & roles — DentCare" },
      { property: "og:description", content: "Manage clinic staff accounts and their roles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AppShell title="Staff & roles">{(me) => <StaffPage me={me} />}</AppShell>,
});

const ROLES: Role[] = ["admin", "dentist", "receptionist"];

function StaffPage({ me }: { me: Staff }) {
  const db = useDb();
  const addStaff = useAddStaff();
  const setRole = useSetStaffRole();
  const removeStaff = useRemoveStaff();
  const resetDemo = useResetDemo();
  const [f, setF] = useState({ name: "", email: "", role: "receptionist" as Role });

  if (!can(me.role, "staff:manage")) {
    return (
      <Card className="p-8 text-center">
        <p className="text-foreground">Only admins can manage staff.</p>
        <Link to="/dashboard" className="mt-2 inline-block text-sm text-primary hover:underline">Back to dashboard</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h2 className="mb-3 font-display text-xl text-foreground">Add staff member</h2>
        <form
          className="flex flex-wrap gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            addStaff.mutate(f, {
              onSuccess: () => {
                toast.success(`Added — they can sign in with password ${DEMO_PASSWORD}`);
                setF({ name: "", email: "", role: "receptionist" });
              },
              onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add staff"),
            });
          }}
        >
          <Input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="w-48" />
          <Input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="w-56" />
          <select className={selectClass + " w-40"} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as Role })}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
          <Button type="submit"><Plus className="mr-1 h-4 w-4" />Add</Button>
        </form>
      </Card>
      <Card className="divide-y divide-border">
        {db.staff.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <div className="flex-1">
              <div className="font-medium text-foreground">{s.name}{s.id === me.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</div>
              <div className="text-sm text-muted-foreground">{s.email}</div>
            </div>
            <select
              aria-label={`Role for ${s.name}`}
              disabled={s.id === me.id}
              className={selectClass + " w-40"}
              value={s.role}
              onChange={(e) => {
                const role = e.target.value as Role;
                setRole.mutate({ id: s.id, role }, { onSuccess: () => toast.success("Role updated") });
              }}
            >
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
            <Button
              variant="ghost"
              size="icon"
              disabled={s.id === me.id}
              aria-label={`Remove ${s.name}`}
              onClick={() => {
                if (!confirm(`Remove ${s.name}?`)) return;
                removeStaff.mutate(s.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </Card>
      <Button
        variant="outline"
        onClick={() => {
          if (confirm("Reset all demo data?")) {
            resetDemo.mutate(undefined, { onSuccess: () => toast.success("Demo data reset") });
          }
        }}
      >
        <RotateCcw className="mr-1 h-4 w-4" />Reset demo data
      </Button>
    </div>
  );
}
