// ============================================
// ORYON FORGE — TypeScript Types
// ============================================

export type ActivityMetric = 'time' | 'distance';

export interface ActivityDefinition {
  id: string;
  name: string;
  icon: string; // lucide icon name
  metric: ActivityMetric;
  minutesPerPoint?: number;
  kmPerPoint?: number;
  description: string;
}

export type GroupRole = 'admin' | 'manager' | 'member';

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  admin_id: string;
  period_days: number;
  start_date: string | null;
  end_date: string | null;
  invite_code: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: GroupRole;
  joined_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  group_id: string;
  activity_type: string;
  duration_minutes: number | null;
  distance_km: number | null;
  points: number;
  proof_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
