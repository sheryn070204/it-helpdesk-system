// Import tools that help us manage CSS classes
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

// This function combines different CSS classes together without errors
export function cn(...inputs) {
  // Merge the classes into one clean string and return it
  return twMerge(clsx(inputs));
}
