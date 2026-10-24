import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Appointment, ClinicDb, Patient, Role, Staff } from "@/lib/clinic";
import { seedDb } from "@/lib/clinic";

type SqlEngine = "libsql" | "postgres";

type Sql = {
  engine: SqlEngine;
  all<T extends Record<string, unknown>>(sql: string, args?: unknown[]): Promise<T[]>;
  run(sql: string, args?: unknown[]): Promise<void>;
};

let sqlPromise: Promise<Sql> | undefined;

function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || "file:./data/clinic.db";
}

function toPostgresParams(sql: string) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function createSql(): Promise<Sql> {
  const url = databaseUrl();
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    const postgres = (await import("postgres")).default;
    const pg = postgres(url, { ssl: url.includes("localhost") ? false : "require", max: 4 });
    return {
      engine: "postgres",
      async all(sql, args = []) {
        return (await pg.unsafe(toPostgresParams(sql), args as never[])) as never;
      },
      async run(sql, args = []) {
        await pg.unsafe(toPostgresParams(sql), args as never[]);
      },
    };
  }

  const { createClient } = await import("@libsql/client");
  let clientUrl = url;
  if (url.startsWith("file:")) {
    const filePath = resolve(process.cwd(), url.slice("file:".length));
    mkdirSync(dirname(filePath), { recursive: true });
    clientUrl = `file:${filePath}`;
  }
  const client = createClient({
    url: clientUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  return {
    engine: "libsql",
    async all(sql, args = []) {
      const result = await client.execute({ sql, args });
      return result.rows as never;
    },
    async run(sql, args = []) {
      await client.execute({ sql, args });
    },
  };
}

function getSql() {
  sqlPromise ??= createSql();
  return sqlPromise;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    dob TEXT NOT NULL,
    gender TEXT NOT NULL,
    alerts TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    dentist_id TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL
  )`,
];

let ready: Promise<void> | undefined;

async function ensureReady() {
  ready ??= (async () => {
    const db = await getSql();
    for (const stmt of SCHEMA) await db.run(stmt);
    const rows = await db.all<{ n: number | bigint }>("SELECT COUNT(*) AS n FROM staff");
    const count = Number(rows[0]?.n ?? 0);
    if (count === 0) await replaceClinic(seedDb());
  })();
  await ready;
}

export async function loadClinic(): Promise<ClinicDb> {
  await ensureReady();
  const db = await getSql();
  const staffRows = await db.all<Staff>("SELECT id, name, email, role FROM staff ORDER BY name");
  const patientRows = await db.all<{
    id: string;
    name: string;
    phone: string;
    dob: string;
    gender: Patient["gender"];
    alerts: string;
    created_at: string;
  }>("SELECT id, name, phone, dob, gender, alerts, created_at FROM patients ORDER BY created_at DESC, name");
  const apptRows = await db.all<{
    id: string;
    patient_id: string;
    dentist_id: string;
    date: string;
    time: string;
    duration: number;
    reason: string;
    status: Appointment["status"];
  }>("SELECT id, patient_id, dentist_id, date, time, duration, reason, status FROM appointments ORDER BY date, time");

  return {
    staff: staffRows.map((s) => ({ id: s.id, name: s.name, email: s.email, role: s.role })),
    patients: patientRows.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      dob: p.dob,
      gender: p.gender,
      alerts: p.alerts,
      createdAt: p.created_at,
    })),
    appointments: apptRows.map((a) => ({
      id: a.id,
      patientId: a.patient_id,
      dentistId: a.dentist_id,
      date: a.date,
      time: a.time,
      duration: Number(a.duration),
      reason: a.reason,
      status: a.status,
    })),
  };
}

async function replaceClinic(clinic: ClinicDb) {
  const db = await getSql();
  await db.run("DELETE FROM appointments");
  await db.run("DELETE FROM patients");
  await db.run("DELETE FROM staff");
  for (const s of clinic.staff) {
    await db.run("INSERT INTO staff (id, name, email, role) VALUES (?, ?, ?, ?)", [s.id, s.name, s.email, s.role]);
  }
  for (const p of clinic.patients) {
    await db.run("INSERT INTO patients (id, name, phone, dob, gender, alerts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
      p.id,
      p.name,
      p.phone,
      p.dob,
      p.gender,
      p.alerts,
      p.createdAt,
    ]);
  }
  for (const a of clinic.appointments) {
    await db.run(
      "INSERT INTO appointments (id, patient_id, dentist_id, date, time, duration, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [a.id, a.patientId, a.dentistId, a.date, a.time, a.duration, a.reason, a.status],
    );
  }
}

export async function insertPatient(patient: Patient) {
  await ensureReady();
  const db = await getSql();
  await db.run("INSERT INTO patients (id, name, phone, dob, gender, alerts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
    patient.id,
    patient.name,
    patient.phone,
    patient.dob,
    patient.gender,
    patient.alerts,
    patient.createdAt,
  ]);
}

export async function deletePatient(id: string) {
  await ensureReady();
  const db = await getSql();
  await db.run("DELETE FROM appointments WHERE patient_id = ?", [id]);
  await db.run("DELETE FROM patients WHERE id = ?", [id]);
}

export async function insertAppointment(appt: Appointment) {
  await ensureReady();
  const db = await getSql();
  await db.run(
    "INSERT INTO appointments (id, patient_id, dentist_id, date, time, duration, reason, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [appt.id, appt.patientId, appt.dentistId, appt.date, appt.time, appt.duration, appt.reason, appt.status],
  );
}

export async function updateAppointmentStatus(id: string, status: Appointment["status"]) {
  await ensureReady();
  const db = await getSql();
  await db.run("UPDATE appointments SET status = ? WHERE id = ?", [status, id]);
}

export async function insertStaff(staff: Staff) {
  await ensureReady();
  const db = await getSql();
  await db.run("INSERT INTO staff (id, name, email, role) VALUES (?, ?, ?, ?)", [staff.id, staff.name, staff.email, staff.role]);
}

export async function updateStaffRole(id: string, role: Role) {
  await ensureReady();
  const db = await getSql();
  await db.run("UPDATE staff SET role = ? WHERE id = ?", [role, id]);
}

export async function deleteStaff(id: string) {
  await ensureReady();
  const db = await getSql();
  await db.run("DELETE FROM staff WHERE id = ?", [id]);
}

export async function resetClinic() {
  await ensureReady();
  ready = undefined;
  await replaceClinic(seedDb());
  await ensureReady();
}

export function describeDatabase() {
  const url = databaseUrl();
  if (url.startsWith("postgres")) return "PostgreSQL";
  if (url.startsWith("libsql://") || url.startsWith("https://")) return "Turso (libSQL cloud)";
  return "SQLite file";
}
