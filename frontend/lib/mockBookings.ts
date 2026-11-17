// frontend/lib/mockBookings.ts

export interface BookingRowItem {
  id: number;
  booking_code: string;
  student_name: string;
  student_id_str: string;
  student_email: string;
  student_phone: string;
  student_avatar?: string;
  student_licence_type: string;
  student_licence_status: string;
  instructor_name: string;
  instructor_code: string;
  instructor_phone: string;
  instructor_avatar?: string;
  assigned_vehicle: string;
  transmission: "Manual" | "Automatic";
  lesson_type: "Manual" | "Automatic";
  lesson_package: string;
  lesson_category: string;
  number_of_lessons: number;
  pickup_location: string;
  dropoff_location: string;
  booking_date: string;
  lesson_date: string;
  formatted_datetime: string;
  start_time: string;
  duration_minutes: number;
  amount_aud: number;
  discount_aud: number;
  final_amount_aud: number;
  payment_method: string;
  payment_status: "paid" | "unpaid" | "refunded";
  transaction_id: string;
  invoice_number: string;
  student_notes: string;
  special_requirements: string;
  admin_notes: string;
  cancellation_reason?: string;
  rescheduling_history?: string;
  status: "upcoming" | "pending" | "completed" | "cancelled";
}

export const DEFAULT_BOOKINGS: BookingRowItem[] = [
  {
    id: 1,
    booking_code: "BK-10045",
    student_name: "John Smith",
    student_id_str: "STU-001",
    student_email: "john@mail.com",
    student_phone: "+61 412 111 222",
    student_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    student_licence_type: "Learner",
    student_licence_status: "Valid",
    instructor_name: "Daniel Okafor",
    instructor_code: "INST-001",
    instructor_phone: "+61 422 333 444",
    instructor_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    assigned_vehicle: "Toyota Camry",
    transmission: "Manual",
    lesson_type: "Manual",
    lesson_package: "Confidence 10",
    lesson_category: "Standard Driving & Assessment",
    number_of_lessons: 10,
    pickup_location: "14 Victoria Road, Parramatta NSW 2150",
    dropoff_location: "14 Victoria Road, Parramatta NSW 2150",
    booking_date: "12 Nov 2026",
    lesson_date: "2026-11-18",
    formatted_datetime: "18 Nov, 10:00 AM",
    start_time: "10:00",
    duration_minutes: 60,
    amount_aud: 85.0,
    discount_aud: 0.0,
    final_amount_aud: 85.0,
    payment_method: "Credit Card",
    payment_status: "paid",
    transaction_id: "TXN-88210",
    invoice_number: "INV-BK10045-2026",
    student_notes: "Needs practice on roundabouts and 3-point turns.",
    special_requirements: "Prefers morning lessons, dual controls car",
    admin_notes: "Booking confirmed via phone. First lesson completed successfully.",
    rescheduling_history: "None - original lesson schedule maintained.",
    status: "upcoming",
  },
  {
    id: 2,
    booking_code: "BK-10044",
    student_name: "Sarah Wilson",
    student_id_str: "STU-002",
    student_email: "sarah@mail.com",
    student_phone: "+61 413 222 333",
    student_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    student_licence_type: "Provisional P1",
    student_licence_status: "Valid",
    instructor_name: "Priya Nair",
    instructor_code: "INST-002",
    instructor_phone: "+61 423 444 555",
    instructor_avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    assigned_vehicle: "Honda Civic",
    transmission: "Automatic",
    lesson_type: "Automatic",
    lesson_package: "Starter 5",
    lesson_category: "RMS Test Warm-up & Route Trial",
    number_of_lessons: 5,
    pickup_location: "45 Station Road, Westmead NSW 2145",
    dropoff_location: "45 Station Road, Westmead NSW 2145",
    booking_date: "11 Nov 2026",
    lesson_date: "2026-11-17",
    formatted_datetime: "17 Nov, 02:00 PM",
    start_time: "14:00",
    duration_minutes: 60,
    amount_aud: 85.0,
    discount_aud: 10.0,
    final_amount_aud: 75.0,
    payment_method: "UPI / PayID",
    payment_status: "paid",
    transaction_id: "TXN-88209",
    invoice_number: "INV-BK10044-2026",
    student_notes: "Focus on RMS Silverwater test routes and reverse parallel parking.",
    special_requirements: "Dual-control automatic car required",
    admin_notes: "Booking requested online, pending manual slot confirmation with Priya.",
    rescheduling_history: "None",
    status: "pending",
  },
  {
    id: 3,
    booking_code: "BK-10043",
    student_name: "Michael Brown",
    student_id_str: "STU-003",
    student_email: "michael@mail.com",
    student_phone: "+61 414 333 444",
    student_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    student_licence_type: "Learner",
    student_licence_status: "Valid",
    instructor_name: "Marcus Bell",
    instructor_code: "INST-003",
    instructor_phone: "+61 424 555 666",
    instructor_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    assigned_vehicle: "Toyota Corolla",
    transmission: "Manual",
    lesson_type: "Manual",
    lesson_package: "Test-ready 15",
    lesson_category: "Highway & Motorway Merging",
    number_of_lessons: 15,
    pickup_location: "19 Flushcombe Road, Blacktown NSW 2148",
    dropoff_location: "19 Flushcombe Road, Blacktown NSW 2148",
    booking_date: "10 Nov 2026",
    lesson_date: "2026-11-16",
    formatted_datetime: "16 Nov, 11:00 AM",
    start_time: "11:00",
    duration_minutes: 90,
    amount_aud: 125.0,
    discount_aud: 5.0,
    final_amount_aud: 120.0,
    payment_method: "Credit Card",
    payment_status: "paid",
    transaction_id: "TXN-88208",
    invoice_number: "INV-BK10043-2026",
    student_notes: "Practicing M4 motorway lane changing and ramp merging.",
    special_requirements: "None",
    admin_notes: "Instructor logged 3 hours towards NSW logbook. Student did excellent.",
    rescheduling_history: "None",
    status: "completed",
  },
  {
    id: 4,
    booking_code: "BK-10042",
    student_name: "Emma Davis",
    student_id_str: "STU-004",
    student_email: "emma@mail.com",
    student_phone: "+61 415 444 555",
    student_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    student_licence_type: "Full",
    student_licence_status: "Valid",
    instructor_name: "Sofia Reyes",
    instructor_code: "INST-004",
    instructor_phone: "+61 425 666 777",
    instructor_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    assigned_vehicle: "Hyundai i30",
    transmission: "Automatic",
    lesson_type: "Automatic",
    lesson_package: "Refresher 3",
    lesson_category: "City Driving & Narrow Streets",
    number_of_lessons: 3,
    pickup_location: "12 Railway Street, Liverpool NSW 2170",
    dropoff_location: "12 Railway Street, Liverpool NSW 2170",
    booking_date: "09 Nov 2026",
    lesson_date: "2026-11-15",
    formatted_datetime: "15 Nov, 01:00 PM",
    start_time: "13:00",
    duration_minutes: 60,
    amount_aud: 85.0,
    discount_aud: 0.0,
    final_amount_aud: 85.0,
    payment_method: "PayPal",
    payment_status: "paid",
    transaction_id: "TXN-88207",
    invoice_number: "INV-BK10042-2026",
    student_notes: "International licence conversion refresher.",
    special_requirements: "Prefers female instructor",
    admin_notes: "Overseas licence verified with Service NSW guidelines.",
    rescheduling_history: "Moved from 14 Nov 10 AM to 15 Nov 1 PM at student request.",
    status: "completed",
  },
  {
    id: 5,
    booking_code: "BK-10041",
    student_name: "Daniel Clark",
    student_id_str: "STU-005",
    student_email: "daniel@mail.com",
    student_phone: "+61 416 555 666",
    student_avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    student_licence_type: "Learner",
    student_licence_status: "Valid",
    instructor_name: "Daniel Okafor",
    instructor_code: "INST-001",
    instructor_phone: "+61 422 333 444",
    instructor_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    assigned_vehicle: "Toyota Camry",
    transmission: "Manual",
    lesson_type: "Manual",
    lesson_package: "Starter 5",
    lesson_category: "Beginner Control & Hill Starts",
    number_of_lessons: 5,
    pickup_location: "88 Main Street, Blacktown NSW 2148",
    dropoff_location: "88 Main Street, Blacktown NSW 2148",
    booking_date: "08 Nov 2026",
    lesson_date: "2026-11-14",
    formatted_datetime: "14 Nov, 09:00 AM",
    start_time: "09:00",
    duration_minutes: 60,
    amount_aud: 85.0,
    discount_aud: 0.0,
    final_amount_aud: 85.0,
    payment_method: "Credit Card",
    payment_status: "refunded",
    transaction_id: "TXN-88206",
    invoice_number: "INV-BK10041-2026",
    student_notes: "Clutch pedal control and stall recovery.",
    special_requirements: "Dual controls",
    admin_notes: "Student cancelled due to illness with 48h notice. Full credit issued.",
    cancellation_reason: "Student illness (Medical certificate provided)",
    rescheduling_history: "None",
    status: "cancelled",
  },
];
