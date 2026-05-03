// Import React and tools for making cards
import * as React from "react"
import { cn } from "@/lib/utils" // Tool to merge CSS classes

// This is the main Card container
function Card({
  className,
  size = "default",
  ...props
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      // Apply base styles (background, shadow, border) and custom classes
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 text-sm text-card-foreground ring-1 ring-foreground/10 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props} />
  );
}

// This is the top section of the card (usually for a title)
function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      // Style the header area with padding and alignment
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props} />
  );
}

// This is the bold title text inside the header
function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      // Set the font weight and size for the title
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props} />
  );
}

// This is the smaller description text below the title
function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props} />
  );
}

// This is for buttons or icons that go in the corner of the card header
function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

// This is the main body section of the card where text and info go
function CardContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-content"
      // Apply padding to the content area
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props} />
  );
}

// This is the bottom section of the card (usually for buttons)
function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      // Style the footer with a light background and border
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[size=sm]/card:p-3",
        className
      )}
      {...props} />
  );
}

// Export all the parts so we can build cards in other files
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
