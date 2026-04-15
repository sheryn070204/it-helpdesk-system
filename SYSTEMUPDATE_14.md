# System Update 14

Here is a clear explanation of the things we updated and fixed in the IT Ticketing System today and yesterday:

## 1. Professional Language and Look
We removed the complicated, "hacker" sounding words and replaced them with easy, professional language across all the different screens (Admin, IT Staff, and Employee). This makes the system less intimidating and much easier for everyone to understand and use.

## 2. Better Text Size (Typography)
We made the letters and text bigger and more consistent across the whole system. This means whether you are reading a long ticket description or changing your settings, it is much easier on your eyes.

## 3. Fixed Connection and Saving Errors
There was a stubborn network issue that was stopping people from updating their profile pictures and saving their names. We fixed this! Now, when you type your new information and click save, it connects perfectly with the database and securely saves your changes without showing an error.

## 4. Faster Loading Pages
We made the system much smarter about how it grabs information from the database. Instead of waiting for one piece of data, then the next, it grabs multiple things at the same time. We also added nice "skeleton" loading shapes so you know the page is working instead of just staring at an empty white screen.

## 5. Security Check Fixes
We fixed a bug where some employees were getting a "403 Forbidden" error when they tried to submit a new ticket. We fixed this by double-checking the database's security rules (Row-Level Security) so that the system correctly recognizes who is logged in and allows them to submit their tickets safely.

## 6. Smoother Login
We fixed some annoying redirect loops where the system was getting confused about where to send you after logging in or trying to view pages you weren't supposed to. The system now knows exactly where you belong and drops you there securely.

## 7. Secured Password Updates
We squashed a frustrating bug where admins and IT staff were getting an error when trying to change their passwords. We completely rebuilt the password screen to be beautiful, show green checkmarks when things match, and most importantly, we successfully linked it up with the newest Supabase security rules so your password is unconditionally safe when being updated.

## 8. Next.js App Upgrade
We performed an under-the-hood engine upgrade. The framework handles security files differently now, so we changed our `middleware.js` to a `proxy.js` function, keeping everything running at top speed without crashing on startup.
