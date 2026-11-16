import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "@/types";

export const APP_NAME = "CampusCare";
export const APP_TAGLINE = "Report. Track. Resolve.";

export const CAMPUS_BUILDINGS = [
  "Block A - Faculty of Computing & Informatics",
  "Block B - Faculty of Engineering & Technology",
  "Block C - Faculty of Business & Management",
  "Block D - Faculty of Applied Sciences",
  "Tun Abdul Razak Central Library",
  "Student Affairs & Activity Complex",
  "Perdana Residential College (Hostel A)",
  "Lestari Residential College (Hostel B)",
  "Indah Residential College (Hostel C)",
  "Sports & Gymnasium Arena",
  "Grand Cafeteria & Food Court",
  "Administration & Chancellery Tower",
  "Campus Health & Medical Centre",
  "Central Multi-Storey Parking Complex",
  "Other Campus Location",
];

export const COMPLAINT_CATEGORIES: {
  id: ComplaintCategory;
  name: ComplaintCategory;
  icon: string;
  description: string;
}[] = [
  {
    id: "Electrical",
    name: "Electrical",
    icon: "Zap",
    description: "Lighting, faulty power outlets, tripped breaker, switchboards, wiring issues",
  },
  {
    id: "Plumbing",
    name: "Plumbing",
    icon: "Droplets",
    description: "Leaking pipes, broken faucets, clogged toilets, drainage or low water pressure",
  },
  {
    id: "HVAC / Air Conditioning",
    name: "HVAC / Air Conditioning",
    icon: "Fan",
    description: "Air conditioner malfunctioning, warm airflow, ventilation failure, unusual noise",
  },
  {
    id: "Furniture & Carpentry",
    name: "Furniture & Carpentry",
    icon: "Armchair",
    description: "Broken chairs, study desks, damaged door locks, hinges, window latches, cabinets",
  },
  {
    id: "Cleanliness & Sanitation",
    name: "Cleanliness & Sanitation",
    icon: "Sparkles",
    description: "Trash overflowing, dirty washrooms, floor spills, classroom sanitation",
  },
  {
    id: "Internet & Wi-Fi",
    name: "Internet & Wi-Fi",
    icon: "Wifi",
    description: "Campus Wi-Fi dead zones, intermittent connectivity, router hardware issues",
  },
  {
    id: "Security & Safety",
    name: "Security & Safety",
    icon: "ShieldAlert",
    description: "Faulty emergency lights, broken access cards, CCTV cameras, hazardous pathways",
  },
  {
    id: "Pest Control",
    name: "Pest Control",
    icon: "Bug",
    description: "Infestations of rodents, stray pests, beehives, termites or insects in rooms",
  },
  {
    id: "Civil Infrastructure",
    name: "Civil Infrastructure",
    icon: "Building2",
    description: "Ceiling leaks, cracked walls, broken pavement, pathway potholes, roof issues",
  },
  {
    id: "Other",
    name: "Other",
    icon: "HelpCircle",
    description: "General campus maintenance requests not covered in the categories above",
  },
];

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  { label: string; bg: string; text: string; border: string; dot: string; description: string }
> = {
  Submitted: {
    label: "Submitted",
    bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    text: "text-amber-700",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
    description: "Your report has been received and is queued for facility dispatch review.",
  },
  "In Progress": {
    label: "In Progress",
    bg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    text: "text-blue-700",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
    description: "A maintenance technician has been assigned and repairs are currently underway.",
  },
  Resolved: {
    label: "Resolved",
    bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    text: "text-emerald-700",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
    description: "Maintenance inspection and repairs have been completed and verified.",
  },
  Rejected: {
    label: "Rejected",
    bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    text: "text-rose-700",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-500",
    description: "The issue could not be validated or requires external department consultation.",
  },
};

export const PRIORITY_CONFIG: Record<
  ComplaintPriority,
  { label: string; badge: string; color: string }
> = {
  Low: {
    label: "Low Priority",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    color: "text-slate-500",
  },
  Medium: {
    label: "Medium Priority",
    badge: "bg-sky-100 text-sky-800 border-sky-200",
    color: "text-sky-600",
  },
  High: {
    label: "High Priority",
    badge: "bg-orange-100 text-orange-800 border-orange-200",
    color: "text-orange-600",
  },
  Emergency: {
    label: "Emergency",
    badge: "bg-rose-100 text-rose-800 border-rose-200 animate-pulse",
    color: "text-rose-600",
  },
};
