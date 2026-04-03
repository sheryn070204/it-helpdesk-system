'use client'
import Image from 'next/image'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

/**
 * A reusable component to show a user's picture or their initials.
 */
export function UserAvatar({ 
  avatarUrl, 
  fullName, 
  size = 'md',
  className = '' 
}) {
  // 1. Logic to get initials (e.g., "John Doe" -> "JD")
  const initials = fullName
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
  
  // 2. Define standard sizes for different uses
  const sizes = {
    xs:  { div: 'w-7 h-7',   text: 'text-xs'  },
    sm:  { div: 'w-9 h-9',   text: 'text-sm'  },
    md:  { div: 'w-11 h-11', text: 'text-sm'  },
    lg:  { div: 'w-16 h-16', text: 'text-xl'  },
    xl:  { div: 'w-28 h-28', text: 'text-3xl' },
    default: { div: 'w-11 h-11', text: 'text-sm' },
  }
  
  const s = sizes[size] || sizes.md
  
  return (
    <Avatar className={`${s.div} ${className}`}>
      {/* If we have a URL, show the picture */}
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={fullName || 'Avatar'} 
          className="object-cover" 
        />
      )}
      
      {/* Otherwise, show the initials in an indigo circle */}
      <AvatarFallback className={`${s.text} bg-indigo-600 font-semibold text-white`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
