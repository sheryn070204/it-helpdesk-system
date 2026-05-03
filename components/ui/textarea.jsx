// Import React and tools for making large text boxes
import * as React from "react"
import { cn } from "@/lib/utils" // Tool to merge CSS classes

// This is the Textarea component (for long text like ticket descriptions)
function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      // Style the box (border, background, padding, and focus effects)
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props} />
  );
}

// Export the Textarea so we can use it in our forms
export { Textarea }
