// Import our database connection tool
import { supabase } from './supabase'

// Set the biggest file size allowed to 10 Megabytes
const MAX_FILE_SIZE = 10 * 1024 * 1024 
// Set which types of pictures we allow (JPG, PNG, WebP, and GIF)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * This function sends a picture to our online storage and gives back a link to it.
 */
export async function uploadProof(ticketId, file) {
  // 1. Check if the file is actually a picture we support
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please upload a valid image file (JPG, PNG, WebP, or GIF).')
  }

  // 2. Check if the picture is too heavy (more than 10MB)
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be smaller than 10 MB.')
  }

  // 3. Create a unique name for the file so it doesn't get mixed up
  const fileExt = file.name.split('.').pop() // Get the file extension (like .jpg)
  const fileName = `${Date.now()}.${fileExt}` // Use the current time for the name
  const filePath = `${ticketId}/${fileName}` // Save it in a folder named after the ticket ID
  
  // 4. Send the picture to the 'proofs' folder in Supabase
  console.log(`Starting upload for ticket ${ticketId}...`)
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('proofs')
    .upload(filePath, file, { 
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })
  
  // 5. If something went wrong during upload, show an error
  if (uploadError) {
    console.error('Supabase Storage Error:', uploadError)
    // Tell the user if the 'proofs' bucket is missing
    if (uploadError.message === 'The resource was not found') {
      throw new Error('Storage bucket "proofs" not found. Please create it in your Supabase dashboard.')
    }
    // Tell the user why the upload failed
    throw new Error(`Upload failed: ${uploadError.message}`)
  }
  
  // Log that the upload was successful
  console.log('Upload successful:', uploadData)

  // 6. Get the public internet link for the picture we just uploaded
  const { data } = supabase
    .storage
    .from('proofs')
    .getPublicUrl(filePath)
  
  // 7. Give back the link so we can save it in the database
  return data.publicUrl
}
