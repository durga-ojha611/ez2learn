// frontend/lib/mockBookings.ts

export interface BookingRowItem {
  id: number;
  booking_code: string;
  // Student Details
  student_name: string;
  student_id_str: string;
  student_email: string;
  student_phone: string;
  student_address?: string;
  student_emergency_contact?: string;
  student_avatar?: string;
  student_licence_type: string;
  student_licence_number?: string;
  student_licence_status: string;
  student_logbook_hours?: string;
  // Instructor Details
  instructor_name: string;
  instructor_code: string;
  instructor_phone: string;
  instructor_email?: string;
  instructor_avatar?: string;
  instructor_accreditation?: string;
  instructor_experience?: string;
  assigned_vehicle: string;
  vehicle_rego?: string;
  vehicle_year?: number;
  transmission: "Manual" | "Automatic";
  dual_controls_certified?: boolean;
  // Lesson Details
  lesson_type: "Manual" | "Automatic";
  lesson_package: string;
  lesson_category: string;
  number_of_lessons: number;
  lesson_progress?: string;
  duration_minutes: number;
  pickup_location: string;
  dropoff_location: string;
  // Booking & Schedule
  booking_date: string;
  booking_time?: string;
  lesson_date: string;
  lesson_time?: string;
  formatted_datetime: string;
  start_time: string;
  status: "confirmed" | "upcoming" | "pending" | "completed" | "cancelled";
  // Financial Details
  amount_aud: number;
  discount_aud: number;
  tax_aud?: number;
  final_amount_aud: number;
  payment_method: string;
  payment_status: "paid" | "pending" | "unpaid" | "refunded";
  transaction_id: string;
  invoice_number: string;
  invoice_url?: string;
  // Notes & History
  student_notes: string;
  special_requirements: string;
  admin_notes: string;
  cancellation_reason?: string;
  rescheduling_history?: string;
  competencies_evaluated?: string[];
  initials?: string;
}

// Live real data will be fetched from MySQL Backend API (/api/bookings)
export const DEFAULT_BOOKINGS: BookingRowItem[] = [];
