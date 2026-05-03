// Tell the computer this code runs in the browser
'use client'
// Import tools to show images and circles
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

/**
 * This function shows a user's profile picture or their name initials.
 */
export function UserAvatar({ 
  avatarUrl, // Link to the user's picture
  fullName, // The user's full name
  size = 'md', // How big the circle should be
  className = '' // Extra styling if needed
}) {
  // 1. Create the initials (like "Jane Doe" becomes "JD")
  const initials = fullName
    ?.split(' ') // Split the name into words
    .map(n => n[0]) // Take the first letter of each word
    .join('') // Put them back together
    .toUpperCase() // Make them capital letters
    .slice(0, 2) || '?' // Only keep 2 letters
  
  // 2. Define how big the circle should be for different sizes
  const sizes = {
    xs:  { div: 'w-7 h-7',   text: 'text-xs'  },
    sm:  { div: 'w-9 h-9',   text: 'text-sm'  },
    md:  { div: 'w-11 h-11', text: 'text-sm'  },
    lg:  { div: 'w-16 h-16', text: 'text-xl'  },
    xl:  { div: 'w-28 h-28', text: 'text-3xl' },
    default: { div: 'w-11 h-11', text: 'text-sm' },
  }
  
  // Pick the size the user asked for (default is 'md')
  const s = sizes[size] || sizes.md
  
  return (
    // The main circle container
    <Avatar className={`${s.div} ${className}`}>
      {/* If there is a picture link, show the picture */}
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={fullName || 'Avatar'} 
          className="object-cover" 
        />
      )}
      
      {/* If there is NO picture, show the initials in an indigo circle */}
      <AvatarFallback className={`${s.text} bg-indigo-600 font-semibold text-white`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
