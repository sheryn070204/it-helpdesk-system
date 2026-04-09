import { supabase } from './supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Uploads a file to the 'avatars' bucket and updates the user's profile.
 * Includes validation for file size and type.
 * 
 * @param {string} userId - The user's ID
 * @param {File} file - The image file from the input
 * @returns {string} The public URL of the uploaded image
 */
export async function uploadAvatar(userId, file) {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPG, PNG, or WebP image.')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be smaller than 5 MB.')
  }

  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar.${fileExt}`
  
  // 1. Upload the image to Supabase Storage (upsert replaces existing)
  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(filePath, file, { 
      upsert: true,
      contentType: file.type,
    })
  
  if (uploadError) throw uploadError
  
  // 2. Get the public link to the image
  const { data } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(filePath)
  
  // Add cache-bust param so browsers refresh the image immediately
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`
  
  // 3. Update the 'profiles' table in the database
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)
  
  if (updateError) throw updateError
  
  return publicUrl
}
