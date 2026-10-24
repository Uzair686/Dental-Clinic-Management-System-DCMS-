import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope } from "lucide-react";
import { DEMO_PASSWORD, ROLE_LABEL, seedDb } from "@/lib/clinic";
import { signIn, useDatabaseKind } from "@/lib/clinic-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DentCare — Staff sign-in" },
      { name: "description", content: "Sign in to manage patients, appointments and your dental clinic's day." },
      { property: "og:title", content: "DentCare — Staff sign-in" },
      { property: "og:description", content: "Dental clinic management for admins, dentists and receptionists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignIn,
});

const demoStaff = seedDb().staff;

function SignIn() {
  const navigate = useNavigate();
  const dbKind = useDatabaseKind();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const ok = await signIn(email, password);
      if (!ok) {
        setError("Email or password is incorrect.");
        return;
      }
      navigate({ to: "/dashboard" });
    } catch {
      setError("Could not reach the database. Check DATABASE_URL.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6" />
          <span className="font-display text-2xl">DentCare</span>
        </div>
        <div>
          <p className="font-display text-4xl leading-tight">A calmer day at the clinic, from first call to final check-up.</p>
          <p className="mt-4 text-primary-foreground/80">Patients, appointments and your team in one place.</p>
        </div>
        <p className="text-sm text-primary-foreground/70">Connected to {dbKind}. Patients and appointments are stored in SQL.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="font-display text-3xl text-foreground">Staff sign-in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Welcome back. Sign in to continue.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
          <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
            <p className="mb-2 font-medium text-foreground">Demo accounts (password: {DEMO_PASSWORD})</p>
            {demoStaff.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => { setEmail(s.email); setPassword(DEMO_PASSWORD); }}
                className="flex w-full justify-between rounded px-2 py-1 text-left text-muted-foreground hover:bg-accent"
              >
                <span>{s.email}</span>
                <span className="text-primary">{ROLE_LABEL[s.role]}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
