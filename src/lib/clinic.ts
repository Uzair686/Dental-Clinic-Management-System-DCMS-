export type Role = "admin" | "dentist" | "receptionist";
export type Action = "patients:write" | "appointments:write" | "appointments:status" | "staff:manage";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  dentist: "Dentist",
  receptionist: "Receptionist",
};

const PERMISSIONS: Record<Role, Action[]> = {
  admin: ["patients:write", "appointments:write", "appointments:status", "staff:manage"],
  receptionist: ["patients:write", "appointments:write", "appointments:status"],
  dentist: ["appointments:status"],
};

export function can(role: Role | undefined, action: Action): boolean {
  return !!role && PERMISSIONS[role].includes(action);
}

export type Staff = { id: string; name: string; email: string; role: Role };
export type Patient = {
  id: string;
  name: string;
  phone: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  alerts: string;
  createdAt: string;
};
export type ApptStatus = "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
export type Appointment = {
  id: string;
  patientId: string;
  dentistId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number;
  reason: string;
  status: ApptStatus;
};
export type ClinicDb = { staff: Staff[]; patients: Patient[]; appointments: Appointment[] };

export const DEMO_PASSWORD = "demo123";
export const STATUSES: ApptStatus[] = ["scheduled", "confirmed", "in-progress", "completed", "cancelled"];

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function isoDate(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function seedDb(today = new Date()): ClinicDb {
  const day = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return isoDate(d);
  };
  const staff: Staff[] = [
    { id: "s1", name: "Dr. Ayesha Khan", email: "admin@clinic.demo", role: "admin" },
    { id: "s2", name: "Dr. Bilal Ahmed", email: "dentist@clinic.demo", role: "dentist" },
    { id: "s3", name: "Sana Malik", email: "reception@clinic.demo", role: "receptionist" },
  ];
  const names: [string, Patient["gender"], string][] = [
    ["Hamza Raza", "Male", "Penicillin allergy"],
    ["Fatima Noor", "Female", ""],
    ["Usman Tariq", "Male", "Diabetic"],
    ["Zainab Ali", "Female", "Pregnant"],
    ["Omar Sheikh", "Male", ""],
    ["Hira Javed", "Female", "On blood thinners"],
  ];
  const patients: Patient[] = names.map(([name, gender, alerts], i) => ({
    id: `p${i + 1}`,
    name,
    gender,
    alerts,
    phone: `+92 300 55${String(1000 + i * 137).slice(0, 4)}`,
    dob: `${1975 + i * 5}-0${(i % 9) + 1}-1${i}`,
    createdAt: day(-30 + i),
  }));
  const a = (
    id: string, p: string, d: string, offset: number, time: string, reason: string, status: ApptStatus,
  ): Appointment => ({ id, patientId: p, dentistId: d, date: day(offset), time, duration: 30, reason, status });
  const appointments: Appointment[] = [
    a("a1", "p1", "s2", 0, "09:30", "Root canal follow-up", "completed"),
    a("a2", "p2", "s1", 0, "10:30", "Scaling & polishing", "in-progress"),
    a("a3", "p3", "s2", 0, "12:00", "Tooth extraction", "confirmed"),
    a("a4", "p4", "s1", 0, "15:00", "Routine check-up", "scheduled"),
    a("a5", "p5", "s2", 1, "11:00", "Crown fitting", "scheduled"),
    a("a6", "p6", "s1", 2, "14:30", "Filling", "scheduled"),
    a("a7", "p2", "s2", -2, "16:00", "Consultation", "completed"),
  ];
  return { staff, patients, appointments };
}
