import {
  Complaint,
  ComplaintStats,
  ComplaintStatus,
  SubmitComplaintInput,
} from "@/types";

import { getSupabaseClient } from "../supabase/client";

type ComplaintFormInput = SubmitComplaintInput & {
  subject?: string;
  location?: string;
  building?: string;
  roomFloor?: string;
  room?: string;
  floor?: string;
  locationDetails?: string;
  photoPath?: string;
};

/**
 * Check whether a value is a browser File.
 */
const isFile = (value: unknown): value is File => {
  return typeof File !== "undefined" && value instanceof File;
};

/**
 * Get the real authenticated Supabase user ID.
 * If a valid UUID is already provided, it will use it.
 * Otherwise it gets the ID directly from Supabase Auth.
 */
const resolveAuthenticatedUserId = async (
  suppliedUserId?: string | null
): Promise<string> => {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    suppliedUserId &&
    uuidPattern.test(suppliedUserId.trim())
  ) {
    return suppliedUserId.trim();
  }

  const supabase = getSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    throw new Error(
      "Your login session could not be found. Please sign out and sign in again."
    );
  }

  return user.id;
};

/**
 * Upload complaint photo.
 *
 * Works with:
 * uploadComplaintPhoto(userId, file)
 * uploadComplaintPhoto(file, userId)
 * uploadComplaintPhoto(file)
 */
export async function uploadComplaintPhoto(
  userId: string | null | undefined,
  file: File
): Promise<string>;

export async function uploadComplaintPhoto(
  file: File,
  userId?: string | null
): Promise<string>;

export async function uploadComplaintPhoto(
  first: string | File | null | undefined,
  second?: string | File | null
): Promise<string> {
  let file: File | null = null;
  let suppliedUserId: string | undefined;

  if (isFile(first)) {
    file = first;

    if (typeof second === "string") {
      suppliedUserId = second;
    }
  } else if (isFile(second)) {
    file = second;

    if (typeof first === "string") {
      suppliedUserId = first;
    }
  }

  if (!file) {
    throw new Error(
      "Please upload a valid photo before submitting the complaint."
    );
  }

  const userId = await resolveAuthenticatedUserId(
    suppliedUserId
  );

  const supabase = getSupabaseClient();

  const fileExt =
    file.name && file.name.includes(".")
      ? file.name.split(".").pop()?.toLowerCase() || "jpg"
      : "jpg";

  const uniqueName = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}.${fileExt}`;

  const storagePath = `${userId}/${uniqueName}`;

  const { error } = await supabase.storage
    .from("complaint-photos")
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("bucket not found") ||
      message.includes("not found")
    ) {
      throw new Error(
        "Supabase Storage bucket 'complaint-photos' was not found."
      );
    }

    if (
      message.includes("row-level security") ||
      message.includes("policy") ||
      message.includes("unauthorized")
    ) {
      throw new Error(
        "Photo upload was blocked by the Supabase Storage security policy."
      );
    }

    throw new Error(
      `Photo upload failed: ${error.message}`
    );
  }

  return storagePath;
};

/**
 * Generate temporary signed URL
 * for private complaint photo.
 */
export const getPhotoSignedUrl = async (
  photoPath?: string
): Promise<string | null> => {
  if (!photoPath) {
    return null;
  }

  if (
    photoPath.startsWith("http://") ||
    photoPath.startsWith("https://") ||
    photoPath.startsWith("data:") ||
    photoPath.startsWith("blob:")
  ) {
    return photoPath;
  }

  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase.storage
      .from("complaint-photos")
      .createSignedUrl(photoPath, 3600);

    if (error) {
      console.warn(
        "Unable to generate signed photo URL:",
        error.message
      );

      return null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    console.warn(
      "Unexpected error generating signed photo URL:",
      error
    );

    return null;
  }
};

/**
 * Convert Supabase row to Complaint object.
 */
const mapDatabaseRowToComplaint = (
  row: any
): Complaint => {
  const locationStr =
    row.location ||
    [
      row.building,
      row.room_floor,
      row.location_details,
    ]
      .filter(Boolean)
      .join(", ") ||
    "Campus Location";

  let status: ComplaintStatus = "Submitted";

  if (row.status) {
    const normalizedStatus = String(row.status)
      .toLowerCase()
      .replace(/_/g, " ")
      .trim();

    if (normalizedStatus === "in progress") {
      status = "In Progress";
    } else if (normalizedStatus === "resolved") {
      status = "Resolved";
    } else if (normalizedStatus === "rejected") {
      status = "Rejected";
    } else {
      status = "Submitted";
    }
  }

  return {
    id: row.id,

    ticketId:
      row.ticket_id ||
      row.ticketId ||
      String(row.id || "")
        .substring(0, 8)
        .toUpperCase(),

    userId: row.user_id,

    title: row.title || "",

    category: row.category || "",

    priority: row.priority || "Medium",

    location: locationStr,

    building:
      row.building ||
      locationStr.split(",")[0]?.trim() ||
      locationStr,

    roomFloor:
      row.room_floor ||
      locationStr.split(",")[1]?.trim() ||
      "",

    locationDetails:
      row.location_details || "",

    description:
      row.description || "",

    photoPath:
      row.photo_path ||
      row.photoPath ||
      row.photo_url ||
      undefined,

    photoUrl: undefined,

    status,

    adminRemarks:
      row.admin_remark ||
      row.admin_remarks ||
      "",

    adminRemark:
      row.admin_remark ||
      row.admin_remarks ||
      "",

    assignedTo:
      row.assigned_to || undefined,

    resolvedAt:
      row.resolved_at || undefined,

    createdAt:
      row.created_at ||
      new Date().toISOString(),

    updatedAt:
      row.updated_at ||
      row.created_at ||
      new Date().toISOString(),

    timeline:
      row.timeline || [],
  };
};

/**
 * Get logged-in student's complaints.
 */
export const getComplaints = async (
  suppliedUserId?: string
): Promise<Complaint[]> => {
  let userId: string;

  try {
    userId = await resolveAuthenticatedUserId(
      suppliedUserId
    );
  } catch {
    return [];
  }

  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error fetching complaints:",
        error.message
      );

      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((row: any) =>
      mapDatabaseRowToComplaint(row)
    );
  } catch (error) {
    console.error(
      "Unexpected error fetching complaints:",
      error
    );

    return [];
  }
};

/**
 * Get one complaint using UUID or Ticket ID.
 */
export const getComplaintById = async (
  idOrTicketId: string,
  suppliedUserId?: string
): Promise<Complaint | null> => {
  if (!idOrTicketId) {
    return null;
  }

  const supabase = getSupabaseClient();

  try {
    const userId = suppliedUserId
      ? await resolveAuthenticatedUserId(
          suppliedUserId
        )
      : undefined;

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    let query;

    if (uuidPattern.test(idOrTicketId)) {
      query = supabase
        .from("complaints")
        .select("*")
        .eq("id", idOrTicketId);
    } else {
      query = supabase
        .from("complaints")
        .select("*")
        .eq("ticket_id", idOrTicketId);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } =
      await query.maybeSingle();

    if (error) {
      console.error(
        "Error retrieving complaint:",
        error.message
      );

      return null;
    }

    if (!data) {
      return null;
    }

    const complaint =
      mapDatabaseRowToComplaint(data);

    if (complaint.photoPath) {
      complaint.photoUrl =
        (await getPhotoSignedUrl(
          complaint.photoPath
        )) || undefined;
    }

    return complaint;
  } catch (error) {
    console.error(
      "Unexpected error retrieving complaint:",
      error
    );

    return null;
  }
};

/**
 * Calculate dashboard complaint statistics.
 */
export const getComplaintStats = async (
  suppliedUserId?: string
): Promise<ComplaintStats> => {
  const complaints =
    await getComplaints(suppliedUserId);

  return {
    total: complaints.length,

    submitted: complaints.filter(
      (complaint) =>
        complaint.status === "Submitted"
    ).length,

    inProgress: complaints.filter(
      (complaint) =>
        complaint.status === "In Progress"
    ).length,

    resolved: complaints.filter(
      (complaint) =>
        complaint.status === "Resolved"
    ).length,

    rejected: complaints.filter(
      (complaint) =>
        complaint.status === "Rejected"
    ).length,
  };
};

/**
 * Create complaint in Supabase.
 */
export const createComplaint = async (
  originalInput: SubmitComplaintInput,
  suppliedUserId?: string
): Promise<Complaint> => {
  const supabase = getSupabaseClient();

  const userId =
    await resolveAuthenticatedUserId(
      suppliedUserId
    );

  const input =
    originalInput as ComplaintFormInput;

  const title =
    input.title?.trim() ||
    input.subject?.trim() ||
    "";

  if (!title) {
    throw new Error(
      "Please enter a complaint title."
    );
  }

  const category =
    input.category?.trim() || "";

  if (!category) {
    throw new Error(
      "Please select a complaint category."
    );
  }

  let location =
    input.location?.trim() || "";

  if (!location) {
    const roomOrFloor =
      input.roomFloor?.trim() ||
      input.room?.trim() ||
      input.floor?.trim() ||
      "";

    location = [
      input.building?.trim(),
      roomOrFloor,
      input.locationDetails?.trim(),
    ]
      .filter(Boolean)
      .join(", ");
  }

  if (!location) {
    throw new Error(
      "Please enter the complaint location."
    );
  }

  const description =
    input.description?.trim() || "";

  if (!description) {
    throw new Error(
      "Please enter a complaint description."
    );
  }

  const insertPayload = {
    user_id: userId,

    title,

    category,

    priority:
      input.priority || "Medium",

    location,

    description,

    photo_path:
      input.photoPath || null,
  };

  const { data, error } = await supabase
    .from("complaints")
    .insert(insertPayload)
    .select()
    .single();

  if (error) {
    console.error(
      "Supabase complaint insert error:",
      error
    );

    throw new Error(
      error.message ||
      "Failed to submit complaint."
    );
  }

  if (!data) {
    throw new Error(
      "Complaint was submitted but Supabase returned no complaint record."
    );
  }

  return mapDatabaseRowToComplaint(data);
};