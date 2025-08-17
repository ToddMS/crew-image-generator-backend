export interface BoatType {
  id: number;
  value: string;
  seats: number;
  name: string;
}

export interface Crew {
  id: string;
  name: string;
  clubName: string;
  raceName: string;
  boatType: BoatType;
  crewNames: string[];
  coachName?: string;
}

export interface CrewDB {
  id?: number;
  name: string;
  club_name: string;
  race_name: string;
  coach_name?: string;
  boat_type_id: number;
  user_id?: number;
  userId?: number; // For compatibility with existing code
  crewNames?: string[]; // For crew member names
}

export interface CrewMemberDB {
  id?: number;
  crew_id: number;
  name: string;
  seat_number: number;
}

export interface CreateCrewRequest {
  name: string;
  clubName: string;
  raceName: string;
  boatType: BoatType;
  crewNames: string[];
  coachName?: string;
}

export interface UpdateCrewRequest extends CreateCrewRequest {
  id: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}