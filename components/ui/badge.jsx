// Import React and tools for making labels
import * as React from "react"
import { cva } from "class-variance-authority"; // Tool to help with different styles (variants)
import { Slot } from "radix-ui" // Tool to change the element type
import { cn } from "@/lib/utils" // Tool to merge CSS classes

// This part defines all the different ways a Badge can look
const badgeVariants = cva(
  // These are the base styles for every badge
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // Default style (usually blue)
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        // Secondary style (usually grey)
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        // Destructive style (red) for critical things
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        // Outline style (just a border)
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        // Ghost style (see-through)
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        // Link style (looks like a link)
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    // If we don't pick a style, use "default"
    defaultVariants: {
      variant: "default",
    },
  }
)

// This is the actual Badge component we use in the app
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}) {
  // Decide if we should use a "span" or a custom element
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      // Combine the variant styles and the custom classes
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

// Export the Badge and its styles
export { Badge, badgeVariants }
