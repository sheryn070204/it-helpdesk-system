// Tell the computer this code runs in the browser
"use client"

// Import React and tools for making data tables
import * as React from "react"
import { cn } from "@/lib/utils" // Tool to merge CSS classes

// This is the main Table container
function Table({
  className,
  ...props
}) {
  return (
    // This div lets the table scroll left and right on small phones
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        // Style the table font and spacing
        className={cn("w-full caption-bottom text-sm", className)}
        {...props} />
    </div>
  );
}

// This is the top part of the table (the header row)
function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props} />
  );
}

// This is the main body where all the rows of data go
function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props} />
  );
}

// This is the bottom part of the table (the footer)
function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props} />
  );
}

// This is a single row in the table
function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      // Change color when the mouse hovers over the row
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props} />
  );
}

// This is a single cell in the header row (the column name)
function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      // Style the column header text
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

// This is a single cell in a data row (the actual data)
function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      // Align the text nicely inside the cell
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props} />
  );
}

// This is a small label at the bottom of the table
function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props} />
  );
}

// Export all the parts so we can build tables in other files
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
