// frontend/lib/mockInstructors.ts

export interface InstructorRowItem {
  id: number;
  instructor_code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact?: string;
  languages_spoken?: string[];
  bio?: string;
  status: "active" | "on_leave" | "inactive";
  speciality: "Manual" | "Automatic" | "Both";
  vehicle: string;
  vehicle_rego: string;
  vehicle_year: number;
  transmission: "Manual" | "Automatic" | "Both";
  dual_controls: string;
  insurance_policy?: string;
  insurance_expiry?: string;
  service_areas: string;
  rating: number;
  total_reviews: number;
  pass_rate?: number;
  active_learners: number;
  total_lessons: number;
  accreditation_number: string;
  accreditation_expiry: string;
  police_check_status?: string;
  experience_years: number;
  hourly_rate: number;
  working_days: string;
  working_hours: string;
  wwcc_number: string;
  joined_date: string;
  avatar_url?: string;
  initials: string;
}

// Live real data will be fetched from MySQL Backend API (/api/instructors)
export const DEFAULT_INSTRUCTORS: InstructorRowItem[] = [];
