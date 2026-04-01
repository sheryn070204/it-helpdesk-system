import { Inter } from "next/font/google";
import "./globals.css";

// Load the Inter font from Google Fonts for a clean, professional look
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "IT Helpdesk | Ticketing System",
  description: "Submit and manage IT support tickets efficiently.",
};

/**
 * RootLayout — the outermost shell of the entire application.
 * Every page inherits this layout. It sets the font and base HTML structure.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
