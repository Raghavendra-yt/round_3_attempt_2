import { getDeviceId } from "./deviceId";
import type { ActivityLog, ActivityLogCreate, UserProfile } from "./types";

interface ApiError extends Error {
  status: number;
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



export async function fetchProfile(deviceId: string = getDeviceId()): Promise<UserProfile> {
  return await fetchJson<UserProfile>(`/api/dashboard/profile/${deviceId}`);
}

export async function fetchActivities(deviceId: string = getDeviceId()): Promise<ActivityLog[]> {
  return await fetchJson<ActivityLog[]>(`/api/dashboard/activities/${deviceId}`);
}

export async function logActivity(
  activity: ActivityLogCreate,
  deviceId: string = getDeviceId(),
): Promise<ActivityLog> {
  return await postJson<ActivityLog>(`/api/dashboard/activities/${deviceId}`, activity);
}

export async function updateStreak(
  streak: number,
  deviceId: string = getDeviceId(),
): Promise<UserProfile> {
  const res = await fetch(`/api/dashboard/profile/${deviceId}/streak`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ streak }),
  });
  if (!res.ok) throw new Error(`Failed to update streak (${res.status})`);
  return await res.json();
}

export async function updateChallenge(
  challengeId: string,
  status: string,
  progress: number = 0,
  deviceId: string = getDeviceId(),
): Promise<UserProfile> {
  const res = await fetch(`/api/dashboard/profile/${deviceId}/challenges/${challengeId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, progress }),
  });
  if (!res.ok) throw new Error(`Failed to update challenge (${res.status})`);
  return await res.json();
}
