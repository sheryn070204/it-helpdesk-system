import { supabase } from "./supabase";

/**
 * createNotification - Helper function to generate a new notification in the database.
 * 
 * @param {string} userId - The uuid of the profile to send the notification to.
 * @param {string} ticketId - The uuid of the ticket this notification refers to.
 * @param {string} type - 'ticket_assigned', 'ticket_updated', 'new_ticket', or 'ticket_resolved'.
 * @param {string} message - The actual text displayed to the user.
 * @returns {object} - Success or error response from Supabase.
 */
export async function createNotification(userId, ticketId, type, message) {
  // Security Note: 
  // RLS on the 'notifications' table enforces that users can only SELECT their own 
  // notifications. We permit system-wide insertion (check true) so that an admin 
  // can insert a notification for an IT Staff member, or an IT Staff member can 
  // insert a notification for an employee.

  const { data, error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      ticket_id: ticketId,
      type: type,
      message: message,
      // is_read defaults to false
      // created_at defaults to now()
    },
  ]);

  if (error) {
    console.error(`Failed to create notification: ${error.message}`);
    return { success: false, error };
  }

  return { success: true, data };
}
