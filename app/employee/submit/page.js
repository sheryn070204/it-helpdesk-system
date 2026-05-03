// Tell the computer this code runs in the browser
"use client";

// Import the tools we need
import { useState } from "react"; // For remembering what the user types
import { useRouter } from "next/navigation"; // For moving to different pages
import { supabase } from "@/lib/supabase"; // Our database connection
import {
   Send,
   Loader2,
   MessageSquare,
   HelpCircle,
   ChevronLeft,
   LifeBuoy,
   Zap,
   Info
} from "lucide-react"; // Icons for the design
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"; // UI boxes
import { Input } from "@/components/ui/input"; // Text box for the title
import { Textarea } from "@/components/ui/textarea"; // Big text box for details
import { Button } from "@/components/ui/button"; // Clickable buttons
import { Label } from "@/components/ui/label"; // Text labels
import { toast } from "sonner"; // Small popup messages
import { Badge } from "@/components/ui/badge"; // Small colored labels
import Link from "next/link"; // For clickable links

// This list helps the computer guess how important a ticket is based on words
const PRIORITY_RULES = [
   { keywords: ['urgent', 'emergency', 'asap', 'broken', 'stop', 'expose data'], priority: 'critical' },
   { keywords: ['slow', 'error', 'bug', 'failed', 'cannot access'], priority: 'high' },
   { keywords: ['help', 'question', 'request', 'change', 'new'], priority: 'medium' }
];

// This function looks at the text and decides if it's high or low priority
function detectPriority(text) {
   const content = text.toLowerCase(); // Make everything lowercase to check easily
   for (const rule of PRIORITY_RULES) {
      // If any of the keywords are in the text, use that priority
      if (rule.keywords.some(k => content.includes(k))) {
         return rule.priority;
      }
   }
   return 'low'; // If no keywords are found, it's low priority
}

// Main function for the Submit Ticket page
export default function SubmitTicketPage() {
   const router = useRouter(); // Tool to change pages
   const [title, setTitle] = useState(""); // Remembers the title typed
   const [description, setDescription] = useState(""); // Remembers the description typed
   const [loading, setLoading] = useState(false); // Remembers if we are busy saving

   // This function runs when the user clicks "Submit"
   async function handleSubmit(e) {
      e.preventDefault(); // Stop the page from refreshing
      
      // Make sure the user didn't leave the title empty
      if (!title.trim()) {
         toast.error("Please give your request a title.");
         return;
      }
      // Make sure the user didn't leave the description empty
      if (!description.trim()) {
         toast.error("Please describe the problem.");
         return;
      }

      setLoading(true); // Show the loading spinner
      
      // Get the currently logged-in user's information
      const { data: { user } } = await supabase.auth.getUser();

      // If they are not logged in, show an error
      if (!user) {
         toast.error("Session expired. Please sign in again.");
         setLoading(false);
         return;
      }

      // Automatically guess the priority based on what they typed
      const priority = detectPriority(title + " " + description);

      // Save the new ticket into the "tickets" table in our database
      const { error } = await supabase
         .from("tickets")
         .insert({
            title: title.trim(), // The title they typed
            description: description.trim(), // The details they typed
            priority, // The guessed priority
            submitted_by: user.id, // Their special user ID
            status: "open", // New tickets always start as "open"
         });

      // If the database had an error, tell the user
      if (error) {
         toast.error("Something went wrong. Please try again or contact IT.");
         console.error(error.message);
      } else {
         // If it worked, show a success message and go to the "My Requests" page
         toast.success("Request submitted! We've received your request.");
         router.push("/employee/tickets"); 
         router.refresh();
      }
      setLoading(false); // Hide the loading spinner
   }

   const getPriorityPreview = (p) => {
      const styles = {
         critical: "bg-red-50 text-red-600 border-red-200",
         high: "bg-orange-50 text-orange-600 border-orange-200",
         medium: "bg-blue-50 text-blue-600 border-blue-200",
         low: "bg-emerald-50 text-emerald-600 border-emerald-200",
      };
      return (
         <Badge variant="outline" className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest ${styles[p]}`}>
            {p === 'critical' ? 'Urgent' : p.charAt(0).toUpperCase() + p.slice(1)} Priority
         </Badge>
      );
   };

   return (
      <div className="max-w-[900px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

         <div className="mb-10 flex items-center justify-between">
            <Link href="/employee">
               <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-widest px-4 h-10 rounded-xl group transition-all">
                  <ChevronLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                  Back to Home
               </Button>
            </Link>
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-2.5 rounded-2xl shadow-sm">
               <Zap className="w-4 h-4 text-blue-600" />
               <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Helpdesk Priority Assistant</span>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left: Form */}
            <div className="lg:col-span-8">
               <Card className="bg-white border-none shadow-2xl rounded-[32px] overflow-hidden">
                  <CardHeader className="p-10 sm:p-14 border-b border-slate-50 bg-slate-50/30">
                     <div className="flex items-center gap-5 mb-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                           <MessageSquare className="w-7 h-7" />
                        </div>
                        <div>
                           <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">Submit a <span className="text-blue-600">Support</span> Request</CardTitle>
                           <CardDescription className="text-slate-500 font-medium text-base mt-1">Tell us what's wrong and we'll get it sorted for you.</CardDescription>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent className="p-10 sm:p-14">
                     <form onSubmit={handleSubmit} className="space-y-10">

                        <div className="space-y-4">
                           <div className="flex items-center justify-between ml-1">
                              <Label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                 What's the problem?
                              </Label>
                              {title && getPriorityPreview(detectPriority(title + " " + description))}
                           </div>
                           <Input
                              placeholder="Give it a short title, e.g. My computer won't turn on"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="h-16 bg-slate-50 text-slate-900 border-slate-100 rounded-2xl px-6 font-bold text-lg shadow-inner focus-visible:ring-blue-500 placeholder:text-slate-300"
                           />
                           <p className="text-[10px] text-slate-400 font-medium ml-1">Keep it short and simple.</p>
                        </div>

                        <div className="space-y-4">
                           <Label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-1">
                              Tell us more
                           </Label>
                           <Textarea
                              placeholder="Describe what happened. When did it start? What were you trying to do?"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="min-h-[220px] bg-slate-50 text-slate-900 border-slate-100 rounded-[24px] px-8 py-8 font-medium text-lg shadow-inner focus-visible:ring-blue-500 placeholder:text-slate-300 resize-none leading-relaxed"
                           />
                           <div className="flex items-center justify-between px-1">
                              <p className="text-[10px] text-slate-400 font-medium italic">The more detail you give, the faster we can help.</p>
                              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{description.length} / 500 characters</span>
                           </div>
                        </div>

                        <div className="pt-6">
                           <Button
                              type="submit"
                              disabled={loading}
                              className="w-full h-18 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-[0.2em] shadow-2xl text-[12px] transition-all active:scale-[0.98] group relative overflow-hidden rounded-[26px] border-none py-6"
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                              {loading ? (
                                 <><Loader2 className="w-6 h-6 mr-4 animate-spin" /> Sending your request...</>
                              ) : (
                                 <><Send className="w-6 h-6 mr-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Submit Request</>
                              )}
                           </Button>
                        </div>
                     </form>
                  </CardContent>
               </Card>
            </div>

            {/* Right: Info */}
            <div className="lg:col-span-4 space-y-10">
               <Card className="bg-white border border-slate-100 shadow-xl rounded-[32px] overflow-hidden">
                  <CardHeader className="p-8 border-b border-slate-50">
                     <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-600" />
                        How it works
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                     <div className="space-y-3">
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">We sort your request automatically</p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Once you submit, our IT team will review and assign your request.</p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 group">
                           <div className="w-2 h-2 rounded-full bg-red-500" />
                           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-red-600 transition-colors">Hardware Problem</div>
                        </div>
                        <div className="flex items-center gap-4 group">
                           <div className="w-2 h-2 rounded-full bg-orange-500" />
                           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-orange-600 transition-colors">Internet or Network Issue</div>
                        </div>
                        <div className="flex items-center gap-4 group">
                           <div className="w-2 h-2 rounded-full bg-blue-500" />
                           <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Other / Not sure</div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <div className="bg-blue-600 p-10 rounded-[32px] shadow-2xl text-white relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                     <LifeBuoy className="w-40 h-40" />
                  </div>
                  <h4 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-3">
                     <Info className="w-5 h-5" /> Your request is private
                  </h4>
                  <p className="text-blue-100 text-xs font-medium leading-relaxed opacity-80">Only IT staff can see your submitted requests.</p>
               </div>
            </div>

         </div>

      </div>
   );
}
