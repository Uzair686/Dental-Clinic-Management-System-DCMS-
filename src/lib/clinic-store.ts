import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Appointment, ClinicDb, Patient, Role, Staff } from "./clinic";
import {
  addAppointmentFn,
  addPatientFn,
  addStaffFn,
  deletePatientFn,
  getClinicFn,
  getDatabaseKindFn,
  removeStaffFn,
  resetDemoFn,
  setAppointmentStatusFn,
  setStaffRoleFn,
  signInFn,
} from "./clinic-api";

const SESSION_KEY = "dentcare-session";
const DB_QUERY = ["clinic-db"] as const;

const emptyDb: ClinicDb = { staff: [], patients: [], appointments: [] };

export function useDb(): ClinicDb {
  const q = useQuery({
    queryKey: DB_QUERY,
    queryFn: () => getClinicFn(),
  });
  return q.data ?? emptyDb;
}

export function useDatabaseKind() {
  const q = useQuery({
    queryKey: ["clinic-db-kind"],
    queryFn: () => getDatabaseKindFn(),
  });
  return q.data ?? "SQL";
}

function useInvalidateClinic() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: DB_QUERY });
}

export function useAddPatient() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: (data: Omit<Patient, "id" | "createdAt">) => addPatientFn({ data }),
    onSuccess: invalidate,
  });
}

export function useDeletePatient() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: (id: string) => deletePatientFn({ data: { id } }),
    onSuccess: invalidate,
  });
}

export function useAddAppointment() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: (data: Omit<Appointment, "id" | "status">) => addAppointmentFn({ data }),
    onSuccess: invalidate,
  });
}

export function useSetAppointmentStatus() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: (data: { id: string; status: Appointment["status"] }) => setAppointmentStatusFn({ data }),
    onSuccess: invalidate,
  });
}

export function useAddStaff() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: (data: Omit<Staff, "id">) => addStaffFn({ data }),
    onSuccess: invalidate,
  });
}

export function useSetStaffRole() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: (data: { id: string; role: Role }) => setStaffRoleFn({ data }),
    onSuccess: invalidate,
  });
}

export function useRemoveStaff() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: (id: string) => removeStaffFn({ data: { id } }),
    onSuccess: invalidate,
  });
}

export function useResetDemo() {
  const invalidate = useInvalidateClinic();
  return useMutation({
    mutationFn: () => resetDemoFn(),
    onSuccess: invalidate,
  });
}

const sessionListeners = new Set<() => void>();

function notifySession() {
  sessionListeners.forEach((l) => l());
}

export async function signIn(email: string, password: string) {
  const staff = await signInFn({ data: { email, password } });
  if (!staff) return false;
  localStorage.setItem(SESSION_KEY, staff.id);
  notifySession();
  return true;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
  notifySession();
}

/** undefined = still loading, null = signed out */
export function useSession(): Staff | null | undefined {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const dbQuery = useQuery({
    queryKey: DB_QUERY,
    queryFn: () => getClinicFn(),
  });

  useEffect(() => {
    setReady(true);
    const onChange = () => setTick((n) => n + 1);
    sessionListeners.add(onChange);
    return () => {
      sessionListeners.delete(onChange);
    };
  }, []);

  if (!ready || !dbQuery.data) return undefined;
  void tick;
  const id = localStorage.getItem(SESSION_KEY);
  return dbQuery.data.staff.find((s) => s.id === id) ?? null;
}
