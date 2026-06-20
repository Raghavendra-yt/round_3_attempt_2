export interface ChallengeState {
  id: string;
  status: "active" | "completed";
  progress: number;
}

export interface UserProfile {
  device_id: string;
  total_emissions: number;
  xp: number;
  level: number;
  streak: number;
  challenges: Record<string, ChallengeState>;
}

export interface ActivityLogCreate {
  category: string;
  activity: string;
  impact: number;
}

export interface ActivityLog extends ActivityLogCreate {
  id: string;
  date: string;
  device_id: string;
}
