import {
  Complaint,
  ComplaintStats,
  ComplaintStatus,
  SubmitComplaintInput,
} from "@/types";
import { getSupabaseClient } from "../supabase/client";

/**
 * Uploads a complaint photo to the private Supabase Storage bucket 'complaint-photos'.
 * Structure: {authenticated_user_id}/{unique_filename}
 * Returns: Only the storage path (string), to be saved in complaints.photo_path.
 */
export const uploadComplaintPhoto = async (
  userId: string,
  file: File
): Promise<string> => {
  const supabase = getSupabaseClient();
  const fileExt = file.name.split(".").pop() || "jpg";
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const storagePath = `${userId}/${uniqueName}`;

  const { data, error } = await supabase.storage
    .from("complaint-photos")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    if (
      error.message.toLowerCase().includes("bucket not found") ||
      error.message.toLowerCase().includes("not found")
    ) {
      throw new Error(
        "Supabase Storage bucket 'complaint-photos' was not found. Please create the private bucket 'complaint-photos' in your Supabase project."
      );
    }
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  // Return the storage path
  return storagePath;
};

/**
 * Generates a signed URL to securely display photos stored in the private 'complaint-photos' bucket.
 */
export const getPhotoSignedUrl = async (
  photoPath?: string
): Promise<string | null> => {
  if (!photoPath) return null;

  // If already a full URL or blob
  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:")
  ) {
    return photoPath;
  }

  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.storage
      .from("complaint-photos")
      .createSignedUrl(photoPath, 3600); // 1-hour expiration

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  } catch (err) {
    console.warn("Could not generate signed URL for photo:", err);
  }

  return null;
};

/**
 * Maps Supabase PostgreSQL complaints row into the Complaint TypeScript interface.
 */
const mapDatabaseRowToComplaint = (row: any): Complaint => {
  const locationStr =
    row.location ||
    [row.building, row.room_floor, row.location_details]
      .filter(Boolean)
      .join(", ") ||
    "Campus Location";

  // Normalize status casing: "Submitted" | "In Progress" | "Resolved" | "Rejected"
  let status: ComplaintStatus = "Submitted";
  if (row.status) {
    const lower = row.status.toLowerCase().replace(/_/g, " ");
    if (lower === "in progress") status = "In Progress";
    else if (lower === "resolved") status = "Resolved";
    else if (lower === "rejected") status = "Rejected";
    else status = "Submitted";
  }

  return {
    id: row.id,
    ticketId: row.ticket_id || row.ticketId || row.id.substring(0, 8).toUpperCase(),
    userId: row.user_id,
    title: row.title,
    category: row.category,
    priority: row.priority || "Medium",
    location: locationStr,
    building: row.building || locationStr.split(",")[0] || locationStr,
    roomFloor: row.room_floor || locationStr.split(",")[1] || "",
    locationDetails: row.location_details || "",
    description: row.description,
    photoPath: row.photo_path || row.photoPath || row.photo_url || undefined,
    photoUrl: undefined, // Resolved on-demand via getPhotoSignedUrl
    status,
    adminRemarks: row.admin_remark || row.admin_remarks || "",
    adminRemark: row.admin_remark || row.admin_remarks || "",
    assignedTo: row.assigned_to,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    timeline: row.timeline || [],
  };
};

/**
 * Fetches complaints belonging to the authenticated student from Supabase.
 */
export const getComplaints = async (userId: string): Promise<Complaint[]> => {
  if (!userId) return [];
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching complaints from Supabase:", error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row: any) => mapDatabaseRowToComplaint(row));
  } catch (err) {
    console.error("Unexpected error fetching complaints:", err);
    return [];
  }
};

/**
 * Fetches a single complaint by Ticket ID or UUID.
 */
export const getComplaintById = async (
  idOrTicketId: string,
  userId?: string
): Promise<Complaint | null> => {
  const supabase = getSupabaseClient();

  try {
    let query = supabase
      .from("complaints")
      .select("*")
      .or(`id.eq.${idOrTicketId},ticket_id.eq.${idOrTicketId}`);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    const complaint = mapDatabaseRowToComplaint(data);

    // Resolve private photo signed URL if a photo_path exists
    if (complaint.photoPath) {
      complaint.photoUrl = (await getPhotoSignedUrl(complaint.photoPath)) || undefined;
    }

    return complaint;
  } catch (err) {
    console.error("Error retrieving complaint:", err);
    return null;
  }
};

/**
 * Calculates complaint metrics for the student dashboard using live Supabase data.
 */
export const getComplaintStats = async (
  userId: string
): Promise<ComplaintStats> => {
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
 * Creates and submits a new complaint into public.complaints.
 * Saves: user_id, title, category, priority, location, description, photo_path.
 * The database generates: ticket_id, status, timestamps.
 */
export const createComplaint = async (
  input: SubmitComplaintInput,
  userId: string
): Promise<Complaint> => {
  const supabase = getSupabaseClient();

  const insertPayload: any = {
    user_id: userId,
    title: input.title.trim(),
    category: input.category,
    priority: input.priority || "Medium",
    location: input.location.trim(),
    description: input.description.trim(),
  };

  // Save only the storage path into complaints.photo_path
  if (input.photoPath) {
    insertPayload.photo_path = input.photoPath;
  }

  // Insert into public.complaints
  const { data, error } = await supabase
    .from("complaints")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    // If ticket_id does not have a default sequence trigger, generate human-readable ticket ID
    if (
      error.message.includes("ticket_id") ||
      error.code === "23502" ||
      error.message.toLowerCase().includes("not-null")
    ) {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      insertPayload.ticket_id = `CC-${year}-${randomNum}`;

      const retry = await supabase
        .from("complaints")
        .insert(insertPayload)
        .select()
        .single();

      if (!retry.error && retry.data) {
        return mapDatabaseRowToComplaint(retry.data);
      }
    }

    throw new Error(error.message || "Failed to submit complaint to Supabase.");
  }

  return mapDatabaseRowToComplaint(data);
};
