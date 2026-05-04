// Import our database tool
import { supabase } from "./supabase";

/**
 * This function creates a new alert (notification) for a user.
 */
export async function createNotification(userId, ticketId, type, message) {
  // We are putting a new row into the "notifications" table
  const { data, error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      ticket_id: ticketId,
      type: type,
      message: message,
      is_read: false, // Set to false by default
    },
  ]);

  // If there was a problem saving the alert, show it in the logs
  if (error) {
    console.error(`Failed to create notification: ${error.message}`);
    // Tell the app that it failed
    return { success: false, error };
  }

  // If it worked, tell the app it was successful
  return { success: true, data };
}
