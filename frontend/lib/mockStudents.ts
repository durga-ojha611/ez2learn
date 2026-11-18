// frontend/lib/mockStudents.ts

export interface StudentRowItem {
  id: number;
  student_code: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  location: string;
  suburb: string;
  postcode: string;
  emergency_contact: string;
  licence_type: "Learner" | "Provisional" | "Full";
  licence_stage_detail: string;
  licence_status: "Valid" | "Expired" | "Pending";
  licence_number: string;
  licence_expiry: string;
  preferred_transmission: "Automatic" | "Manual";
  logbook_hours_day: number;
  logbook_hours_night: number;
  logbook_total_required: number;
  driving_experience: string;
  instructor_name: string;
  instructor_code: string;
  instructor_phone: string;
  assigned_vehicle: string;
  package_name: string;
  lessons: number;
  remaining_lessons: number;
  next_lesson_datetime: string;
  pickup_address: string;
  dropoff_address: string;
  status: "active" | "inactive";
  total_paid: number;
  payment_status: "paid" | "pending" | "partially_paid";
  avatar_url?: string;
  initials: string;
  joined_date: string;
  learning_notes: string;
  special_requirements: string;
  competencies: {
    skill: string;
    status: "Mastered" | "In Progress" | "Needs Practice";
  }[];
}

// Live real data will be fetched from MySQL Backend API (/api/students)
export const DEFAULT_STUDENTS: StudentRowItem[] = [];
