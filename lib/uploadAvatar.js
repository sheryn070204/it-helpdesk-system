// Import our database tool
import { supabase } from './supabase'

// Set the biggest file size allowed to 5 Megabytes
const MAX_FILE_SIZE = 5 * 1024 * 1024 
// Set which types of pictures we allow (JPG, PNG, and WebP)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * This function saves a profile picture to our online storage and updates the user's name card.
 */
export async function uploadAvatar(userId, file) {
  // Check if the file is a picture we support
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.')
  }

  // Check if the picture is too heavy (more than 5MB)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be smaller than 5 MB.')
  }

  // Create a name for the file based on the user's ID
  const fileExt = file.name.split('.').pop() // Get the ending (like .png)
  const filePath = `${userId}/avatar.${fileExt}` // Put it in a folder named after the user
  
  // 1. Send the picture to the 'avatars' folder in Supabase
  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(filePath, file, { 
      upsert: true, // If there is an old picture, replace it
      contentType: file.type, // Tell Supabase it's an image
    })
  
  // If something went wrong during upload, show an error
  if (uploadError) throw uploadError
  
  // 2. Get the public link to the picture we just uploaded
  const { data } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  // Add a small piece of text at the end so the browser knows to show the new picture immediately
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`
  
  // 3. Save this new link into the user's "profile" in the database
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl }) // Update their avatar link
    .eq('id', userId) // Find the right user by their ID
  
  // If we couldn't save the link in the database, show an error
  if (updateError) throw updateError
  
  // Give back the link to the picture
  return publicUrl
}
