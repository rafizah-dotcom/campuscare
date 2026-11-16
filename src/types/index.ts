export type UserRole = "student" | "admin";

export type ComplaintStatus = "Submitted" | "In Progress" | "Resolved" | "Rejected";

export type ComplaintPriority = "Low" | "Medium" | "High" | "Emergency";

export type ComplaintCategory =
  | "Electrical"
  | "Plumbing"
  | "HVAC / Air Conditioning"
  | "Furniture & Carpentry"
  | "Cleanliness & Sanitation"
  | "Internet & Wi-Fi"
  | "Security & Safety"
  | "Pest Control"
  | "Civil Infrastructure"
  | "Other";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface ComplaintTimelineItem {
  id: string;
  complaintId: string;
  status: ComplaintStatus;
  note: string;
  actionBy: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketId: string;
  userId: string;
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  building: string;
  roomFloor: string;
  locationDetails?: string;
  description: string;
  photoUrl?: string;
  status: ComplaintStatus;
  adminRemarks?: string;
  assignedTo?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: ComplaintTimelineItem[];
  user?: Partial<UserProfile>;
}

export interface ComplaintStats {
  total: number;
  submitted: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface SubmitComplaintInput {
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  building: string;
  roomFloor: string;
  locationDetails?: string;
  description: string;
  photoUrl?: string;
}
