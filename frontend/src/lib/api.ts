import type { ActivityLog, ActivityLogCreate, UserProfile } from "./types";

interface ApiError extends Error {
  status: number;
}

function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && typeof (err as ApiError).status === "number";
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    const err: ApiError = Object.assign(new Error(`Request to ${path} failed (${res.status})`), {
      status: res.status,
    });
    throw err;
  }
  return (await res.json()) as T;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err: ApiError = Object.assign(new Error(`Request to ${path} failed (${res.status})`), {
      status: res.status,
    });
    throw err;
  }
  return (await res.json()) as T;
}

function shouldThrow(err: unknown): boolean {
  if (isApiError(err)) {
    if (err.status === 404 || err.status === 405) {
      return false;
    }
    return true;
  }
  return false;
}

const LOCAL_DEVICE_ID = "local-device-12345";

export async function fetchProfile(deviceId: string = LOCAL_DEVICE_ID): Promise<UserProfile> {
  try {
    return await fetchJson<UserProfile>(`/api/dashboard/profile/${deviceId}`);
  } catch (err: unknown) {
    if (shouldThrow(err)) throw err;
    // Fallback if backend is unavailable
    return {
      device_id: deviceId,
      total_emissions: 8500,
      xp: 0,
      level: 1,
      streak: 1,
      challenges: {},
    };
  }
}

export async function fetchActivities(deviceId: string = LOCAL_DEVICE_ID): Promise<ActivityLog[]> {
  try {
    return await fetchJson<ActivityLog[]>(`/api/dashboard/activities/${deviceId}`);
  } catch (err: unknown) {
    if (shouldThrow(err)) throw err;
    return [];
  }
}

export async function logActivity(
  activity: ActivityLogCreate,
  deviceId: string = LOCAL_DEVICE_ID,
): Promise<ActivityLog> {
  try {
    return await postJson<ActivityLog>(`/api/dashboard/activities/${deviceId}`, activity);
  } catch (err: unknown) {
    if (shouldThrow(err)) throw err;
    // Fallback if backend is unavailable
    return {
      ...activity,
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      device_id: deviceId,
    };
  }
}
