// frontend/lib/mockCalendar.ts

export interface CalendarLessonItem {
  id: string;
  booking_id: string;
  booking_date: string; // e.g. "07 Nov 2026"
  date: string; // YYYY-MM-DD
  day_number: number;
  start_time: string; // e.g. "02:00 PM"
  time_24: string; // e.g. "14:00"
  duration_minutes: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  lesson_type: "Manual" | "Automatic";
  lesson_package: string;
  pickup_location: string;
  dropoff_location: string;
  color_scheme: "blue" | "yellow" | "green" | "purple" | "red" | "orange";

  // Student
  student_name: string;
  student_email: string;
  student_phone: string;
  student_licence: string;
  student_avatar: string;

  // Instructor
  instructor_name: string;
  instructor_code: string;
  instructor_phone: string;
  instructor_vehicle: string;
  instructor_avatar: string;

  // Financial
  total_amount: number;
  discount: number;
  final_amount: number;
  payment_status: "Paid" | "Pending" | "Refunded";
  transaction_id: string;

  // Additional
  student_notes: string;
  special_requirements: string;
}

// Live real calendar events will be fetched from MySQL Backend API (/api/calendar/events)
export const MOCK_CALENDAR_LESSONS: CalendarLessonItem[] = [];

export const INSTRUCTORS_FILTER_LIST = [
  "All Instructors",
  "Aisha Khan",
  "Rohan Mehta",
  "Sneha Patel",
  "Daniel Cooper",
  "Michael Zhang",
  "Priya Sharma",
  "Karan Singh",
  "Aman Verma",
  "Kevin O'Connor",
];

export const STUDENTS_FILTER_LIST = [
  "All Students",
  "Liam Walker",
  "Chloe Nguyen",
  "Oliver Smith",
  "Diya Sharma",
  "Ethan Davies",
  "Sophie Taylor",
  "John Smith",
  "Sarah Wilson",
  "Aman Verma",
  "Neha Kapoor",
];
