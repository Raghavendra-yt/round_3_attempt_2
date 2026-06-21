import { getDeviceId } from "./deviceId";
import type { ActivityLog, ActivityLogCreate, UserProfile } from "./types";

interface ApiError extends Error {
  status: number;
}

const isStaticHost = typeof window !== "undefined" && (
  window.location.hostname.endsWith("github.io") || 
  window.location.hostname.includes("localhost") === false && window.location.hostname.includes("127.0.0.1") === false
);

// Local storage keys
const PROFILE_KEY_PREFIX = "carbon_profile_";
const ACTIVITIES_KEY_PREFIX = "carbon_activities_";

function getLocalProfile(deviceId: string): UserProfile {
  const key = PROFILE_KEY_PREFIX + deviceId;
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data) as UserProfile;
  }
  // Default profile matching backend defaults
  const defaultProfile: UserProfile = {
    device_id: deviceId,
    total_emissions: 8500.0, // Default matching backend (8.5 Tons)
    xp: 0,
    level: 1,
    streak: 0,
    challenges: {},
  };
  localStorage.setItem(key, JSON.stringify(defaultProfile));
  return defaultProfile;
}

function saveLocalProfile(deviceId: string, profile: UserProfile) {
  localStorage.setItem(PROFILE_KEY_PREFIX + deviceId, JSON.stringify(profile));
}

function getLocalActivities(deviceId: string): ActivityLog[] {
  const key = ACTIVITIES_KEY_PREFIX + deviceId;
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data) as ActivityLog[];
  }
  // Default activities matching standard dataset
  const defaultActivities: ActivityLog[] = [
    {
      id: "log-1",
      date: "Today, 08:30",
      category: "transport",
      activity: "Petrol Car - 15km",
      impact: 2.8,
      device_id: deviceId,
    },
    {
      id: "log-2",
      date: "Yesterday",
      category: "food",
      activity: "Average Meat Diet",
      impact: 5.5,
      device_id: deviceId,
    },
    {
      id: "log-3",
      date: "Oct 24, 2023",
      category: "utilities",
      activity: "Electricity - 12 KWh",
      impact: 4.1,
      device_id: deviceId,
    },
  ];
  localStorage.setItem(key, JSON.stringify(defaultActivities));
  return defaultActivities;
}

function saveLocalActivities(deviceId: string, activities: ActivityLog[]) {
  localStorage.setItem(ACTIVITIES_KEY_PREFIX + deviceId, JSON.stringify(activities));
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
  if (isStaticHost) {
    return getLocalProfile(deviceId);
  }
  try {
    return await fetchJson<UserProfile>(`/api/dashboard/profile/${deviceId}`);
  } catch (err) {
    console.warn("API unavailable, falling back to localStorage", err);
    return getLocalProfile(deviceId);
  }
}

export async function fetchActivities(deviceId: string = getDeviceId()): Promise<ActivityLog[]> {
  if (isStaticHost) {
    return getLocalActivities(deviceId);
  }
  try {
    return await fetchJson<ActivityLog[]>(`/api/dashboard/activities/${deviceId}`);
  } catch (err) {
    console.warn("API unavailable, falling back to localStorage", err);
    return getLocalActivities(deviceId);
  }
}

export async function logActivity(
  activity: ActivityLogCreate,
  deviceId: string = getDeviceId(),
): Promise<ActivityLog> {
  if (isStaticHost) {
    const profile = getLocalProfile(deviceId);
    const newLog: ActivityLog = {
      id: "log-" + Math.random().toString(36).substring(2, 11),
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      device_id: deviceId,
      ...activity,
    };
    const activities = getLocalActivities(deviceId);
    saveLocalActivities(deviceId, [newLog, ...activities]);

    profile.total_emissions += activity.impact;
    profile.xp += 10;
    if (profile.xp >= profile.level * 100) {
      profile.level += 1;
      profile.xp = 0;
    }
    saveLocalProfile(deviceId, profile);
    return newLog;
  }
  try {
    return await postJson<ActivityLog>(`/api/dashboard/activities/${deviceId}`, activity);
  } catch (err) {
    console.warn("API unavailable, falling back to localStorage", err);
    const profile = getLocalProfile(deviceId);
    const newLog: ActivityLog = {
      id: "log-" + Math.random().toString(36).substring(2, 11),
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      device_id: deviceId,
      ...activity,
    };
    const activities = getLocalActivities(deviceId);
    saveLocalActivities(deviceId, [newLog, ...activities]);

    profile.total_emissions += activity.impact;
    profile.xp += 10;
    if (profile.xp >= profile.level * 100) {
      profile.level += 1;
      profile.xp = 0;
    }
    saveLocalProfile(deviceId, profile);
    return newLog;
  }
}

export async function updateStreak(
  streak: number,
  deviceId: string = getDeviceId(),
): Promise<UserProfile> {
  if (isStaticHost) {
    const profile = getLocalProfile(deviceId);
    profile.streak = streak;
    saveLocalProfile(deviceId, profile);
    return profile;
  }
  try {
    const res = await fetch(`/api/dashboard/profile/${deviceId}/streak`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ streak }),
    });
    if (!res.ok) throw new Error(`Failed to update streak (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn("API unavailable, falling back to localStorage", err);
    const profile = getLocalProfile(deviceId);
    profile.streak = streak;
    saveLocalProfile(deviceId, profile);
    return profile;
  }
}

export async function updateChallenge(
  challengeId: string,
  status: string,
  progress: number = 0,
  deviceId: string = getDeviceId(),
): Promise<UserProfile> {
  if (isStaticHost) {
    const profile = getLocalProfile(deviceId);
    profile.challenges[challengeId] = {
      id: challengeId,
      status: status as any,
      progress,
    };
    saveLocalProfile(deviceId, profile);
    return profile;
  }
  try {
    const res = await fetch(`/api/dashboard/profile/${deviceId}/challenges/${challengeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, progress }),
    });
    if (!res.ok) throw new Error(`Failed to update challenge (${res.status})`);
    return await res.json();
  } catch (err) {
    console.warn("API unavailable, falling back to localStorage", err);
    const profile = getLocalProfile(deviceId);
    profile.challenges[challengeId] = {
      id: challengeId,
      status: status as any,
      progress,
    };
    saveLocalProfile(deviceId, profile);
    return profile;
  }
}
