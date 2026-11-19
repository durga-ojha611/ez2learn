// frontend/types/index.ts

export type RoleName = 'super_admin' | 'booking_manager' | 'instructor_coordinator' | 'content_editor' | 'finance_viewer';

export interface AdminUser {
  id: number;
  role_id: number;
  role_name?: RoleName;
  role_display_name?: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login_at?: string;
  permissions?: string[];
  accessible_sections?: string[];
}

export type TransmissionType = 'automatic' | 'manual' | 'both';

export type BookingStatus = 'new_request' | 'pending' | 'confirmed' | 'assigned' | 'completed' | 'cancelled' | 'rescheduled';

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'partially_refunded';

export type LicenceStage = 'learner' | 'provisional_p1' | 'provisional_p2' | 'full_licence' | 'overseas_conversion';

export interface Student {
  id: number;
  student_code?: string;
  first_name?: string;
  last_name?: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  avatar_url?: string;
  address?: string;
  suburb: string;
  postcode: string;
  licence_number?: string;
  licence_stage: LicenceStage;
  licence_status?: 'valid' | 'expired' | 'pending_verification' | 'suspended';
  preferred_transmission: TransmissionType;
  preferred_instructor_id?: number;
  preferred_instructor_name?: string;
  learning_objective?: string;
  driving_experience?: string;
  completed_lessons: number;
  remaining_lessons?: number;
  recorded_instructor_hours: number;
  nsw_logbook_hours: number;
  total_spent: number;
  total_paid?: number;
  pending_payments?: number;
  upcoming_bookings_count?: number;
  cancelled_bookings_count?: number;
  last_lesson_date?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  status: 'active' | 'inactive' | 'graduated' | 'pending_verification';
  created_at?: string;
  bookings?: any[];
  payments?: any[];
  logbook_analytics?: {
    target_hours: number;
    recorded_instructor_hours: number;
    nsw_3_for_1_bonus_hours: number;
    max_bonus_cap: number;
    bonus_cap_reached: boolean;
    progress_percent: number;
  };
}

export interface Instructor {
  id: number;
  instructor_code?: string;
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  accreditation_number: string;
  accreditation_expiry?: string;
  experience_years: number;
  hourly_rate: number;
  transmission: TransmissionType;
  gender: 'male' | 'female' | 'other';
  bio?: string;
  teaching_approach?: string;
  qualifications?: string;
  address?: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_rego: string;
  is_dual_control: boolean | number;
  ancap_safety_rating: number;
  service_areas?: Suburb[] | string;
  active_learners?: number;
  total_lessons?: number;
  status: 'active' | 'inactive' | 'pending_approval' | 'suspended' | 'on_leave' | 'onboarding';
  rating: number;
  total_reviews: number;
  working_days?: string[];
  working_hours_start?: string;
  working_hours_end?: string;
  service_suburbs_list?: string;
  documents?: InstructorDocument[];
  bookings?: any[];
  reviews?: any[];
  availability?: any[];
  stats?: {
    total_lessons: number;
    completed_count: number;
    cancelled_count: number;
    total_earnings: number;
  };
}

export interface InstructorDocument {
  id: number;
  instructor_id: number;
  document_type: string;
  title: string;
  file_path: string;
  expiry_date?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

export interface Suburb {
  id: number;
  city_id: number;
  name: string;
  postcode: string;
  region: string;
  is_active: number | boolean;
  assigned_instructors_count?: number;
  total_bookings_count?: number;
}

export interface ServiceItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  transmission: TransmissionType;
  duration_minutes: number;
  price_aud: number;
  description?: string;
  included_features?: string[];
  is_featured: boolean | number;
  is_active: boolean | number;
  booking_count?: number;
}

export interface PackageItem {
  id: number;
  name: string;
  slug: string;
  lesson_count: number;
  duration_per_lesson: number;
  price_aud: number;
  discount_amount: number;
  popular_badge: boolean | number;
  description?: string;
  features?: string[];
  is_active: boolean | number;
  booking_count?: number;
}

export interface Booking {
  id: number;
  booking_code: string;
  student_id: number;
  student_name: string;
  student_email?: string;
  student_phone?: string;
  student_avatar?: string;
  licence_stage?: LicenceStage;
  licence_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  nsw_logbook_hours?: number;
  student_completed_lessons?: number;
  instructor_id?: number;
  instructor_name?: string;
  instructor_phone?: string;
  instructor_avatar?: string;
  accreditation_number?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_rego?: string;
  service_id?: number;
  service_name?: string;
  package_id?: number;
  package_name?: string;
  transmission: 'automatic' | 'manual';
  lesson_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  pickup_address: string;
  pickup_suburb: string;
  pickup_postcode: string;
  dropoff_address?: string;
  special_notes?: string;
  amount_aud: number;
  booking_status: BookingStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  transaction_id?: string;
  discount_aud?: number;
  final_amount_aud?: number;
  lesson_package?: string;
  lesson_category?: string;
  number_of_lessons?: number;
  student_notes?: string;
  special_requirements?: string;
  admin_notes?: string;
  rescheduling_history?: string;
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
  history?: BookingHistoryItem[];
  payments?: PaymentItem[];
}

export interface BookingHistoryItem {
  id: number;
  booking_id: number;
  admin_name?: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  comment?: string;
  created_at: string;
}

export interface PaymentItem {
  id: number;
  transaction_id: string;
  booking_id: number;
  student_id: number;
  student_name?: string;
  booking_code?: string;
  amount_aud: number;
  payment_method: string;
  payment_status: PaymentStatus;
  receipt_number?: string;
  refund_amount?: number;
  refund_reason?: string;
  paid_at?: string;
}

export interface ReviewItem {
  id: number;
  booking_id?: number;
  student_id: number;
  instructor_id: number;
  student_name: string;
  student_code?: string;
  student_avatar?: string;
  student_email?: string;
  student_phone?: string;
  instructor_name: string;
  instructor_code?: string;
  instructor_avatar?: string;
  booking_code?: string;
  booking_ref?: string;
  lesson_type?: string;
  rating: number;
  review_text: string;
  admin_response?: string | null;
  admin_response_at?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  is_featured?: boolean | number;
  submitted_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  category: 'booking' | 'student' | 'instructor' | 'payment' | 'review' | 'system';
  related_id?: number;
  link_url?: string;
  is_read: boolean | number;
  created_at: string;
}


export interface CmsPageSummary {
  id: number;
  page_key: string;
  title: string;
  meta_description?: string;
  updated_at: string;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: number | boolean;
}

export interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  caption?: string;
  category: string;
  is_published: number | boolean;
  sort_order: number;
}


export interface InquiryItem {
  id: number;
  name: string;
  subject?: string;
  email: string;
  phone: string;
  suburb: string;
  lesson_type: string;
  message: string;
  status: "new" | "replied" | "contacted" | "converted" | "closed";
  preferred_date?: string;
  preferred_time?: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
