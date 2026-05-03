// Tell the computer this code runs in the browser
"use client"

// Import tools for showing popup notifications
import { useTheme } from "next-themes" // Tool to know if we are in light or dark mode
import { Toaster as Sonner } from "sonner"; // The main notification tool
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react" // Icons for different types of alerts

// This is the Toaster component that manages all the small popup messages (toasts)
const Toaster = ({
  ...props
}) => {
  // Check what theme the user is using
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      // Define which icons to show for success, error, or loading
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      // Set the colors and shapes for the popup boxes
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)"
        }
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props} />
  );
}

// Export the Toaster so we can put it in our main layout
export { Toaster }
