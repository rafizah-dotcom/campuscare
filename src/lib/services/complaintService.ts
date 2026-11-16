import { Complaint, ComplaintStats, ComplaintStatus, SubmitComplaintInput } from "@/types";
import { getSupabaseClient, isSupabaseConfigured } from "../supabase/client";
import { INITIAL_COMPLAINTS } from "../mock-data";

const LOCAL_STORAGE_KEY = "campuscare_complaints_v1";

// Helper to get complaints from localStorage or initial mock data
const getLocalComplaints = (): Complaint[] => {
  if (typeof window === "undefined") {
    return INITIAL_COMPLAINTS;
  }

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(stored);
  } catch (err) {
    console.error("Failed to parse local complaints:", err);
    return INITIAL_COMPLAINTS;
  }
};

// Helper to save complaints to localStorage
const saveLocalComplaints = (complaints: Complaint[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(complaints));
    } catch (err) {
      console.error("Failed to save local complaints:", err);
    }
  }
};

/**
 * Generates a human-friendly ticket ID: CC-YYYY-XXXX
 */
export const generateTicketId = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CC-${year}-${randomNum}`;
};

/**
 * Uploads a complaint photo to Supabase Storage or creates a local data URL preview.
 */
export const uploadComplaintPhoto = async (file: File): Promise<string> => {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `complaints/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("complaint-attachments")
      .upload(filePath, file);

    if (uploadError) {
      console.warn("Supabase storage upload failed, falling back to local preview:", uploadError.message);
    } else {
      const { data } = supabase.storage
        .from("complaint-attachments")
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
  }

  // Fallback: Read as base64 Data URL for instant preview & offline persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Fetches all complaints. Filters by userId if provided.
 */
export const getComplaints = async (userId?: string): Promise<Complaint[]> => {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase
        .from("complaints")
        .select(`
          *,
          timeline:complaint_timeline(*)
        `)
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        // Map Supabase snake_case to CamelCase
        return data.map((item: any) => ({
          id: item.id,
          ticketId: item.ticket_id,
          userId: item.user_id,
          title: item.title,
          category: item.category,
          priority: item.priority,
          building: item.building,
          roomFloor: item.room_floor,
          locationDetails: item.location_details,
          description: item.description,
          photoUrl: item.photo_url,
          status: item.status,
          adminRemarks: item.admin_remarks,
          assignedTo: item.assigned_to,
          resolvedAt: item.resolved_at,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          timeline: item.timeline || [],
        }));
      }
    } catch (err) {
      console.warn("Failed fetching from Supabase, falling back to local data:", err);
    }
  }

  // Local storage fallback
  const all = getLocalComplaints();
  if (userId) {
    return all.filter((c) => c.userId === userId);
  }
  return all;
};

/**
 * Fetches a single complaint by ID or Ticket ID.
 */
export const getComplaintById = async (idOrTicket: string): Promise<Complaint | null> => {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select(`
          *,
          timeline:complaint_timeline(*)
        `)
        .or(`id.eq.${idOrTicket},ticket_id.eq.${idOrTicket}`)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          ticketId: data.ticket_id,
          userId: data.user_id,
          title: data.title,
          category: data.category,
          priority: data.priority,
          building: data.building,
          roomFloor: data.room_floor,
          locationDetails: data.location_details,
          description: data.description,
          photoUrl: data.photo_url,
          status: data.status,
          adminRemarks: data.admin_remarks,
          assignedTo: data.assigned_to,
          resolvedAt: data.resolved_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          timeline: data.timeline || [],
        };
      }
    } catch (err) {
      console.warn("Supabase fetch single complaint error, falling back:", err);
    }
  }

  const all = getLocalComplaints();
  return (
    all.find(
      (c) =>
        c.id.toLowerCase() === idOrTicket.toLowerCase() ||
        c.ticketId.toLowerCase() === idOrTicket.toLowerCase()
    ) || null
  );
};

/**
 * Calculates complaint statistics for dashboard cards.
 */
export const getComplaintStats = async (userId?: string): Promise<ComplaintStats> => {
  const complaints = await getComplaints(userId);

  return {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === "Submitted").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    rejected: complaints.filter((c) => c.status === "Rejected").length,
  };
};

/**
 * Creates and submits a new complaint.
 */
export const createComplaint = async (
  input: SubmitComplaintInput,
  userId: string,
  userName = "Student"
): Promise<Complaint> => {
  const ticketId = generateTicketId();
  const now = new Date().toISOString();

  const newComplaint: Complaint = {
    id: `cmp_${Date.now()}`,
    ticketId,
    userId,
    title: input.title,
    category: input.category,
    priority: input.priority || "Medium",
    building: input.building,
    roomFloor: input.roomFloor,
    locationDetails: input.locationDetails || "",
    description: input.description,
    photoUrl: input.photoUrl,
    status: "Submitted",
    adminRemarks: "Complaint registered. Awaiting facility supervisor assignment.",
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        id: `tl_${Date.now()}_1`,
        complaintId: `cmp_${Date.now()}`,
        status: "Submitted",
        note: `Complaint filed via CampusCare portal. Assigned ticket ${ticketId}.`,
        actionBy: `${userName} (Student)`,
        createdAt: now,
      },
    ],
  };

  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert({
          ticket_id: ticketId,
          user_id: userId,
          title: input.title,
          category: input.category,
          priority: input.priority || "Medium",
          building: input.building,
          room_floor: input.roomFloor,
          location_details: input.locationDetails || null,
          description: input.description,
          photo_url: input.photoUrl || null,
          status: "Submitted",
          admin_remarks: newComplaint.adminRemarks,
        })
        .select()
        .single();

      if (!error && data) {
        // Also insert timeline record
        await supabase.from("complaint_timeline").insert({
          complaint_id: data.id,
          status: "Submitted",
          note: `Complaint submitted. Ticket ID: ${data.ticket_id}`,
          action_by: userName,
        });

        return {
          ...newComplaint,
          id: data.id,
          ticketId: data.ticket_id,
        };
      }
    } catch (err) {
      console.warn("Supabase insert error, saving to local store:", err);
    }
  }

  // Save to local storage
  const all = getLocalComplaints();
  const updated = [newComplaint, ...all];
  saveLocalComplaints(updated);

  return newComplaint;
};

/**
 * Updates a complaint's status and admin remarks.
 * Prepared for the Admin Module to update complaints seamlessly.
 */
export const updateComplaintStatus = async (
  complaintId: string,
  newStatus: ComplaintStatus,
  adminRemarks?: string,
  assignedTo?: string,
  adminName = "Administrator"
): Promise<Complaint | null> => {
  const now = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const updates: any = {
        status: newStatus,
        updated_at: now,
      };
      if (adminRemarks !== undefined) updates.admin_remarks = adminRemarks;
      if (assignedTo !== undefined) updates.assigned_to = assignedTo;
      if (newStatus === "Resolved") updates.resolved_at = now;

      const { data, error } = await supabase
        .from("complaints")
        .update(updates)
        .eq("id", complaintId)
        .select()
        .single();

      if (!error && data) {
        await supabase.from("complaint_timeline").insert({
          complaint_id: complaintId,
          status: newStatus,
          note: adminRemarks || `Status changed to ${newStatus}`,
          action_by: adminName,
        });

        return getComplaintById(complaintId);
      }
    } catch (err) {
      console.warn("Supabase update error, falling back locally:", err);
    }
  }

  // Local update
  const all = getLocalComplaints();
  const index = all.findIndex((c) => c.id === complaintId || c.ticketId === complaintId);
  if (index === -1) return null;

  const target = all[index];
  const updatedItem: Complaint = {
    ...target,
    status: newStatus,
    adminRemarks: adminRemarks !== undefined ? adminRemarks : target.adminRemarks,
    assignedTo: assignedTo !== undefined ? assignedTo : target.assignedTo,
    resolvedAt: newStatus === "Resolved" ? now : target.resolvedAt,
    updatedAt: now,
    timeline: [
      ...(target.timeline || []),
      {
        id: `tl_${Date.now()}`,
        complaintId: target.id,
        status: newStatus,
        note: adminRemarks || `Status updated to ${newStatus}`,
        actionBy: adminName,
        createdAt: now,
      },
    ],
  };

  all[index] = updatedItem;
  saveLocalComplaints(all);
  return updatedItem;
};
