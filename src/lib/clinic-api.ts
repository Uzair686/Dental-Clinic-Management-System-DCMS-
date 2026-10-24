import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DEMO_PASSWORD, uid, isoDate, type ApptStatus, type Patient, type Role } from "./clinic";

const patientInput = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  dob: z.string().min(1),
  gender: z.enum(["Male", "Female", "Other"]),
  alerts: z.string(),
});

const appointmentInput = z.object({
  patientId: z.string().min(1),
  dentistId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.number().int().positive(),
  reason: z.string().trim().min(1),
});

const staffInput = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "dentist", "receptionist"]),
});

export const getClinicFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = await import("../server/sql.server");
  return db.loadClinic();
});

export const getDatabaseKindFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = await import("../server/sql.server");
  return db.describeDatabase();
});

export const signInFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string() }))
  .handler(async ({ data }) => {
    if (data.password !== DEMO_PASSWORD) return null;
    const db = await import("../server/sql.server");
    const clinic = await db.loadClinic();
    return clinic.staff.find((s) => s.email.toLowerCase() === data.email.trim().toLowerCase()) ?? null;
  });

export const addPatientFn = createServerFn({ method: "POST" })
  .validator(patientInput)
  .handler(async ({ data }) => {
    const db = await import("../server/sql.server");
    const patient: Patient = { id: uid(), createdAt: isoDate(new Date()), ...data, name: data.name.trim() };
    await db.insertPatient(patient);
    return patient;
  });

export const deletePatientFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = await import("../server/sql.server");
    await db.deletePatient(data.id);
  });

export const addAppointmentFn = createServerFn({ method: "POST" })
  .validator(appointmentInput)
  .handler(async ({ data }) => {
    const db = await import("../server/sql.server");
    const clinic = await db.loadClinic();
    const clash = clinic.appointments.some(
      (a) => a.dentistId === data.dentistId && a.date === data.date && a.time === data.time && a.status !== "cancelled",
    );
    if (clash) throw new Error("That dentist already has an appointment at this time.");
    const appt = { id: uid(), status: "scheduled" as const, ...data };
    await db.insertAppointment(appt);
    return appt;
  });

export const setAppointmentStatusFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), status: z.enum(["scheduled", "confirmed", "in-progress", "completed", "cancelled"]) }))
  .handler(async ({ data }) => {
    const db = await import("../server/sql.server");
    await db.updateAppointmentStatus(data.id, data.status as ApptStatus);
  });

export const addStaffFn = createServerFn({ method: "POST" })
  .validator(staffInput)
  .handler(async ({ data }) => {
    const db = await import("../server/sql.server");
    const clinic = await db.loadClinic();
    if (clinic.staff.some((s) => s.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("That email is already in use.");
    }
    const staff = { id: uid(), ...data };
    await db.insertStaff(staff);
    return staff;
  });

export const setStaffRoleFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), role: z.enum(["admin", "dentist", "receptionist"]) }))
  .handler(async ({ data }) => {
    const db = await import("../server/sql.server");
    await db.updateStaffRole(data.id, data.role as Role);
  });

export const removeStaffFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    const db = await import("../server/sql.server");
    await db.deleteStaff(data.id);
  });

export const resetDemoFn = createServerFn({ method: "POST" }).handler(async () => {
  const db = await import("../server/sql.server");
  await db.resetClinic();
});
