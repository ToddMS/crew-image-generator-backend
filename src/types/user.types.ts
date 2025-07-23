export interface User {
  id: number;
  google_id?: string;
  email: string;
  name: string;
  profile_picture?: string;
  club_name?: string;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ClubSettings {
  id: number;
  user_id: number;
  primary_color: string;
  secondary_color: string;
  logo_filename?: string;
  logo_upload_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  google_id?: string;
  email: string;
  name: string;
  profile_picture?: string;
  club_name?: string;
  password_hash?: string;
}

export interface UpdateClubSettingsData {
  primary_color?: string;
  secondary_color?: string;
  logo_filename?: string;
}