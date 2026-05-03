// Tell the computer this code runs in the browser
"use client"

// Import React and tools for making divider lines
import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui" // Radix tool for separators
import { cn } from "@/lib/utils" // Tool to merge CSS classes

// This is the Separator component (a simple line to divide sections)
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      // Set the line to be horizontal or vertical depending on what we need
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props} />
  );
}

// Export the Separator so we can use it in our pages
export { Separator }
