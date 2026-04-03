import { supabase } from './supabase'

/**
 * Uploads a file to the 'avatars' bucket and updates the user's profile.
 * 
 * @param {string} userId - The user's ID
 * @param {File} file - The image file from the input
 * @returns {string} The public URL of the uploaded image
 */
export async function uploadAvatar(userId, file) {
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`
  
  // 1. Upload the image to Supabase Storage
  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })
  
  if (uploadError) throw uploadError
  
  // 2. Get the public link to the image
  const { data } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  // 3. Update the 'profiles' table in the database
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId)
  
  if (updateError) throw updateError
  
  return data.publicUrl
}
