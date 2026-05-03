// Import the "Inter" font from Google to make the text look modern
import { Inter } from "next/font/google";
// Import the global styles (CSS) for the whole app
import "./globals.css";
// Import the tool that shows popup messages (toasts)
import { Toaster } from "@/components/ui/sonner";

// Configure the Inter font to be used in the app
const inter = Inter({ subsets: ["latin"] });

// This part tells search engines (like Google) the name of our website
export const metadata = {
  title: "IT Helpdesk | Ticketing System",
  description: "Submit and manage IT support tickets efficiently.",
};

/**
 * This is the main "shell" of the entire website. 
 * Every page we build is placed inside this shell.
 */
export default function RootLayout({ children }) {
  return (
    // Set the language to English and the height to full screen
    <html lang="en" className="h-full">
      {/* Set the font and background color for the entire body */}
      <body className={`${inter.className} h-full antialiased bg-gray-50 text-slate-900`}>
        {/* This is where the actual content of each page will appear */}
        {children}
        {/* This tool allows us to show success or error messages in the corner */}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
