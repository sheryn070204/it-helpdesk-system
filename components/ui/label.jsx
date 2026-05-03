// Tell the computer this code runs in the browser
"use client"

// Import React and tools for making labels
import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui" // Radix tool for accessible labels
import { cn } from "@/lib/utils" // Tool to merge CSS classes

// This is the Label component (text that goes above or next to an input)
function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      // Style the label (font size, weight, and behavior when disabled)
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

// Export the Label so we can use it in our forms
export { Label }
