import { Complaint, UserProfile } from "@/types";

/**
 * Temporary local mock user for testing while Supabase is not connected.
 * When Supabase is connected, the application dynamically displays the real user from auth/database.
 */
export const MOCK_USER_FIZA: UserProfile = {
  id: "usr_fiza_mock_01",
  email: "fiza@student.campus.edu",
  fullName: "Fiza",
  role: "student",
  studentId: "STU1024",
  department: "Faculty of Computing & Informatics",
  phone: "+60 12-345 6789",
  createdAt: "2026-01-10T08:00:00Z",
};

export const DEMO_ADMIN: UserProfile = {
  id: "usr_admin_demo_01",
  email: "admin.facilities@campus.edu",
  fullName: "Facilities Admin",
  role: "admin",
  department: "Estate Management & Maintenance Division",
  phone: "+60 3-8999 1234",
  createdAt: "2025-08-01T08:00:00Z",
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: "cmp-001",
    ticketId: "CC-2026-1048",
    userId: "usr_fiza_mock_01",
    title: "Leaking Ceiling Pipe near Server Room Door",
    category: "Plumbing",
    priority: "High",
    building: "Block A - Faculty of Computing & Informatics",
    roomFloor: "Level 3, Corridor near Lab 3B & Server Room",
    locationDetails: "Water droplets falling onto carpet tiles, hazardous wet floor near power cables.",
    description:
      "Water is dripping steadily from the overhead aircon/plumbing ceiling panel. Carpet is soaked and water is slowly spreading towards the computer lab entrance. Urgent inspection required to prevent electrical hazards.",
    photoUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
    status: "Submitted",
    adminRemarks: "Received by facilities hotline desk. Dispatched plumbing unit for initial assessment.",
    assignedTo: "Facilities Rapid Response Team",
    createdAt: "2026-11-16T08:30:00Z",
    updatedAt: "2026-11-16T09:15:00Z",
    timeline: [
      {
        id: "tl-001-1",
        complaintId: "cmp-001",
        status: "Submitted",
        note: "Complaint submitted through CampusCare Student Portal.",
        actionBy: "Student",
        createdAt: "2026-11-16T08:30:00Z",
      },
    ],
  },
  {
    id: "cmp-002",
    ticketId: "CC-2026-1035",
    userId: "usr_fiza_mock_01",
    title: "Classroom Central AC Unit Blowing Warm Air",
    category: "HVAC / Air Conditioning",
    priority: "Medium",
    building: "Block B - Faculty of Engineering & Technology",
    roomFloor: "Lecture Hall B-201",
    locationDetails: "Wall cassette unit 2 on the right side of the whiteboard.",
    description:
      "The ceiling air conditioner is making a grinding fan noise and only expelling warm room air. Temperatures inside the lecture hall are exceeding 29°C during afternoon classes.",
    photoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80",
    status: "In Progress",
    adminRemarks:
      "HVAC technician En. Hafiz assigned. Capacitor replacement and refrigerant check scheduled today at 2:30 PM. Lecture hall will remain accessible.",
    assignedTo: "En. Hafiz (CoolTech HVAC Services)",
    createdAt: "2026-11-15T14:10:00Z",
    updatedAt: "2026-11-16T10:00:00Z",
    timeline: [
      {
        id: "tl-002-1",
        complaintId: "cmp-002",
        status: "Submitted",
        note: "Complaint logged by student.",
        actionBy: "Student",
        createdAt: "2026-11-15T14:10:00Z",
      },
      {
        id: "tl-002-2",
        complaintId: "cmp-002",
        status: "In Progress",
        note: "Assigned to En. Hafiz (CoolTech HVAC). Work order #WO-8910 generated.",
        actionBy: "Facilities Admin",
        createdAt: "2026-11-16T10:00:00Z",
      },
    ],
  },
  {
    id: "cmp-003",
    ticketId: "CC-2026-0982",
    userId: "usr_fiza_mock_01",
    title: "Flickering Overhead Fluorescent Tube & Exposed Switch",
    category: "Electrical",
    priority: "Medium",
    building: "Tun Abdul Razak Central Library",
    roomFloor: "2nd Floor Quiet Study Area, Row 14",
    locationDetails: "Directly above study carrels 14A and 14B.",
    description:
      "Fluorescent bulb is constantly blinking and producing a loud buzzing noise that disturbs study groups. Light switch plate has a crack.",
    photoUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
    status: "Resolved",
    adminRemarks:
      "Electrician installed high-efficiency LED ballast and tube. Replaced wall switch plate with new safety enclosure. Completed and tested.",
    assignedTo: "Campus Electrical Unit (Team 2)",
    resolvedAt: "2026-11-14T16:30:00Z",
    createdAt: "2026-11-13T11:20:00Z",
    updatedAt: "2026-11-14T16:30:00Z",
    timeline: [
      {
        id: "tl-003-1",
        complaintId: "cmp-003",
        status: "Submitted",
        note: "Submitted with photo attachment.",
        actionBy: "Student",
        createdAt: "2026-11-13T11:20:00Z",
      },
      {
        id: "tl-003-2",
        complaintId: "cmp-003",
        status: "In Progress",
        note: "Assigned to Campus Electrical Unit.",
        actionBy: "Facilities Admin",
        createdAt: "2026-11-13T15:00:00Z",
      },
      {
        id: "tl-003-3",
        complaintId: "cmp-003",
        status: "Resolved",
        note: "LED replacement completed. Tested voltage and safety cover secured.",
        actionBy: "Technician Salleh",
        createdAt: "2026-11-14T16:30:00Z",
      },
    ],
  },
  {
    id: "cmp-004",
    ticketId: "CC-2026-0920",
    userId: "usr_fiza_mock_01",
    title: "Broken Study Table Leg and Loose Drawer",
    category: "Furniture & Carpentry",
    priority: "Low",
    building: "Perdana Residential College (Hostel A)",
    roomFloor: "Block A4, Room 412",
    locationDetails: "Room 412 study desk (Right occupant)",
    description:
      "The wooden bracket holding the front left table leg has snapped, causing the desk to tilt dangerously. Heavy textbooks cannot be placed on it.",
    photoUrl: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80",
    status: "Resolved",
    adminRemarks:
      "Hostel carpentry workshop repaired bracket with reinforced steel corner brace and leveled all desk legs.",
    assignedTo: "Pak Cik Rahim (Hostel Maintenance)",
    resolvedAt: "2026-11-10T12:00:00Z",
    createdAt: "2026-11-09T09:00:00Z",
    updatedAt: "2026-11-10T12:00:00Z",
    timeline: [
      {
        id: "tl-004-1",
        complaintId: "cmp-004",
        status: "Submitted",
        note: "Logged by hostel resident.",
        actionBy: "Student",
        createdAt: "2026-11-09T09:00:00Z",
      },
      {
        id: "tl-004-2",
        complaintId: "cmp-004",
        status: "In Progress",
        note: "Carpentry inspection performed.",
        actionBy: "Hostel Admin",
        createdAt: "2026-11-09T14:30:00Z",
      },
      {
        id: "tl-004-3",
        complaintId: "cmp-004",
        status: "Resolved",
        note: "Table brace replaced and confirmed stable.",
        actionBy: "Pak Cik Rahim",
        createdAt: "2026-11-10T12:00:00Z",
      },
    ],
  },
];
