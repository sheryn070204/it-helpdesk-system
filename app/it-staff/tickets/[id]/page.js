// Tell the computer this code runs in the browser
"use client";

// Import all the tools we need from React and Next.js
import { useState, useEffect, useCallback, use, useRef } from "react";
import { useRouter } from "next/navigation"; // Tool for changing pages
import Link from "next/link"; // For clickable links
import { supabase } from "@/lib/supabase"; // Connection to our database
import { createNotification } from "@/lib/notifications"; // Tool to send alerts to users
import { uploadProof } from "@/lib/uploadProof"; // Tool to upload work evidence images
import { toast } from "sonner"; // For small popup messages

// Import UI components for the design
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Import icons to make the page look professional
import { 
  Loader2, 
  Copy, 
  ChevronLeft,
  Calendar as CalendarIcon,
  Hash as HashIcon,
  Settings,
  Save,
  User as UserIcon,
  Clock as ClockIcon,
  Activity as ActivityIcon,
  Image as ImageIcon,
  FileText,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Small colored labels
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // User profile pictures

// Main function for the IT Staff Ticket Detail page
export default function StaffTicketDetailPage({ params }) {
  const router = useRouter(); // Helper to navigate between pages
  const resolvedParams = use(params); // Extract the ID from the URL
  const ticketId = resolvedParams.id;

  // These "states" remember the ticket data and if we are busy
  const [ticket, setTicket] = useState(null); 
  const [loading, setLoading] = useState(true); // Page is still fetching data
  const [saving, setSaving] = useState(false); // Changes are being saved
  const [error, setError] = useState(""); // Holds any error messages

  // These remember what the IT Staff is editing
  const [selectedStatus, setSelectedStatus] = useState(""); // The new status they picked
  const [resolutionNotes, setResolutionNotes] = useState(""); // Explanation of the fix
  const [proofFile, setProofFile] = useState(null); // The image file to be uploaded
  const [proofPreview, setProofPreview] = useState(null); // A temporary preview of the image
  const fileInputRef = useRef(null); // Reference to the hidden file picker

  // This stops the data from loading twice by accident
  const hasFetched = useRef(false);

  // This function fetches the specific ticket's data from the database
  const fetchData = useCallback(async (id) => {
    setLoading(true); // Show loading spinner
    setError(""); // Reset any old errors

    try {
      // Check if the staff member is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login"); // Redirect if not logged in
        return;
      }

      // Fetch the ticket data without any joins
      const { data: ticketData, error: ticketError } = await supabase
        .from("tickets")
        .select(`
          id, title, description, priority, status, created_at, assigned_to, submitted_by,
          proof_url, resolution_notes
        `)
        .eq("id", id)
        .single();

      if (ticketError) throw new Error("Ticket not found or unauthorized access.");

      // MANUALLY get the profiles for submitter and assignee
      const personIds = [];
      if (ticketData.submitted_by) personIds.push(ticketData.submitted_by);
      if (ticketData.assigned_to) personIds.push(ticketData.assigned_to);

      if (personIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", personIds);

        // Attach them to the ticket object
        ticketData.submitter = profiles?.find(p => p.id === ticketData.submitted_by);
        ticketData.assignee = profiles?.find(p => p.id === ticketData.assigned_to);
      }

      // Save the data to our states to display it
      setTicket(ticketData);
      setSelectedStatus(ticketData.status);
      setResolutionNotes(ticketData.resolution_notes || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Hide loading spinner
    }
  }, [router]);

  // Load the data as soon as the page opens
  useEffect(() => {
    if (ticketId && !hasFetched.current) {
      hasFetched.current = true;
      fetchData(ticketId);
    }
  }, [ticketId, fetchData]);

  // This function saves the IT staff's updates to the database
  async function handleSaveChanges() {
    setSaving(true); // Show "Saving..." spinner
    try {
      // Get the current staff member's ID
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      let proof_url = ticket.proof_url; // Start with the existing image link
      
      // 1. If a new proof image was picked, upload it to storage
      if (proofFile) {
        const loadingToast = toast.loading("Uploading proof image...");
        try {
          proof_url = await uploadProof(ticketId, proofFile); // Send to Supabase Storage
          toast.success("Image uploaded successfully", { id: loadingToast });
        } catch (uploadErr) {
          toast.error(`Upload failed: ${uploadErr.message}`, { id: loadingToast });
          setSaving(false);
          return;
        }
      }

      // 2. Update the ticket record with the new status and notes
      const { error: updateError } = await supabase
        .from("tickets")
        .update({ 
          status: selectedStatus,
          resolution_notes: resolutionNotes,
          proof_url: proof_url
        })
        .eq("id", ticketId);

      if (updateError) throw updateError;

      toast.success("Changes saved successfully.");

      // 3. Send a notification to the employee about the update
      if (selectedStatus !== ticket?.status) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        const staffName = profile?.full_name || "IT Staff";

        if (selectedStatus === "in_progress") {
          // Alert user that work has started
          await createNotification(
            ticket.submitted_by,
            ticketId,
            "ticket_updated",
            `🔄 Your ticket '${ticket.title}' is now being handled by ${staffName}.`
          );
        } else if (selectedStatus === "resolved") {
          // Alert user that the ticket is finished
          await createNotification(
            ticket.submitted_by,
            ticketId,
            "ticket_resolved",
            `✅ Resolution reached for '${ticket.title}'. Please verify the fix.`
          );
        }
      }

      // Refresh the screen with updated data
      fetchData(ticketId);
      setProofFile(null); // Reset the file picker
      setProofPreview(null); // Reset the image preview
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message);
    } finally {
      setSaving(false); // Hide saving spinner
    }
  }

  // Handle choosing a file for proof
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      // Create a preview image URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove the selected proof file
  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Copy the Ticket ID for easy sharing
  const copyToClipboard = () => {
    navigator.clipboard.writeText(ticket?.id);
    toast.info("Ticket ID copied");
  };

  // Small component for priority label colors
  const PriorityBadge = ({ priority }) => {
    const colors = {
      low: "bg-slate-100 text-slate-600 border-slate-200",
      medium: "bg-blue-50 text-blue-700 border-blue-200",
      high: "bg-orange-50 text-orange-700 border-orange-200",
      urgent: "bg-red-50 text-red-700 border-red-200",
      critical: "bg-red-50 text-red-700 border-red-200"
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colors[priority?.toLowerCase()] || colors.low}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
      </span>
    );
  };

  // Small component for status label colors
  const StatusBadge = ({ status }) => {
    const configs = {
      open: "bg-blue-50 text-blue-700 border-blue-200",
      in_progress: "bg-yellow-50 text-yellow-700 border-yellow-200",
      resolved: "bg-green-50 text-green-700 border-green-200",
      closed: "bg-slate-100 text-slate-500 border-slate-200"
    };
    const labelMap = {
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed"
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${configs[status] || configs.open}`}>
        {labelMap[status] || status}
      </span>
    );
  };

  // Generate initials for avatar placeholders
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Show loading screen if data is being fetched
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
        <p className="text-slate-500 font-semibold">Loading ticket details...</p>
      </div>
    );
  }

  // Show error card if something went wrong
  if (error && !ticket) {
    return (
      <Card className="max-w-2xl mx-auto mt-20 border-slate-200 shadow-sm bg-white rounded-2xl">
        <CardContent className="p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 border border-red-100">
            <UserIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-slate-900 font-bold text-2xl mb-2">Notice</h3>
          <p className="text-slate-500 text-base mb-8">{error}</p>
          <Link href="/it-staff/tickets">
            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-8 h-11 rounded-xl font-semibold">
              Back to Tickets
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Helpers to display user information
  const submitterName = ticket?.submitter?.full_name || (ticket?.submitted_by ? `User (${ticket.submitted_by.slice(0,8)})` : 'Unknown User');
  const assignedStaff = ticket?.assignee;

  // History log of ticket actions
  const activityLog = [
    { description: "Ticket created by employee", created_at: ticket.created_at },
    ...(ticket.assigned_to ? [{ description: `Ticket assigned to ${ticket.assignee?.full_name}`, created_at: ticket.created_at }] : [])
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-100 min-h-screen max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* ─── TOP NAVIGATION ─── */}
      <div className="flex items-center justify-between">
        <Link href="/it-staff/tickets">
          <Button variant="ghost" className="text-slate-500 hover:text-slate-900 font-semibold px-0 -ml-2">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Tickets
          </Button>
        </Link>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-mono text-xs px-3 py-1.5 rounded-lg">
             Ticket Ref: {ticket.id.slice(0, 8).toUpperCase()}
           </Badge>
           <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-9 w-9 text-slate-400 hover:text-blue-600 rounded-lg">
             <Copy className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ─── LEFT COLUMN: TICKET DETAILS ─── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Badges for priority and current status */}
              <PriorityBadge priority={ticket?.priority} />
              <StatusBadge status={ticket?.status} />
              <span className="text-sm text-slate-400 flex items-center gap-1.5 ml-auto">
                <CalendarIcon className="h-4 w-4" />
                {new Date(ticket?.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            {/* Ticket Title */}
            <h1 className="text-2xl font-bold text-slate-900">{ticket?.title}</h1>
            
            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Submitted By</p>
                  <p className="text-base font-semibold text-slate-900">{submitterName}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <HashIcon className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Ticket ID</p>
                  <p className="text-base font-semibold text-slate-700 font-mono">{ticket?.id?.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Ticket Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Description</h3>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket?.description || 'No description provided.'}</p>
              </div>
            </div>

            {/* RESOLUTION AUDIT (Visible only if notes or proof exists) */}
            {(ticket?.status === 'resolved' || ticket?.status === 'closed' || ticket?.resolution_notes || ticket?.proof_url) && (
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Resolution Information</h3>
                </div>
                
                {/* Display notes provided by IT staff */}
                {ticket?.resolution_notes && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-500">Staff Notes:</p>
                    <div className="bg-green-50/50 border border-green-100 p-5 rounded-xl">
                      <p className="text-slate-700 leading-relaxed">{ticket.resolution_notes}</p>
                    </div>
                  </div>
                )}

                {/* Display the proof of work image */}
                {ticket?.proof_url && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-500">Proof of Work:</p>
                    <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <img 
                        src={ticket.proof_url} 
                        alt="Proof of work" 
                        className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACTIVITY TIMELINE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center"><ClockIcon className="h-5 w-5 text-slate-500" /></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Activity Log</h3>
                <p className="text-sm text-slate-500">History of updates on this ticket</p>
              </div>
            </div>
            <div className="space-y-3">
              {activityLog.map((log, i) => (
                <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5"><ActivityIcon className="h-4 w-4 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-slate-700 font-medium">{log.description}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: CONTROL PANEL ─── */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center"><Settings className="h-5 w-5 text-blue-600" /></div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ticket Actions</h3>
                <p className="text-sm text-slate-500">Manage this ticket</p>
              </div>
            </div>

            {/* STATUS SELECTOR */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Update Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-11 text-base border-slate-200 rounded-xl bg-slate-50"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RESOLUTION INPUTS (Visible when resolving) */}
            {(selectedStatus === "resolved" || selectedStatus === "closed") && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Resolution Notes</label>
                  <textarea 
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how the issue was fixed..."
                    className="w-full min-h-[100px] p-4 text-sm border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Upload Proof (Image)</label>
                  {!proofPreview ? (
                    // Clickable area to upload image
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-slate-100 hover:border-blue-300 cursor-pointer transition-all group"
                    >
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-xs font-medium text-slate-500">Click to upload photo evidence</p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    // Show preview of picked image
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={proofPreview} alt="Preview" className="w-full h-32 object-cover" />
                      <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg"
                        onClick={removeProof}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ASSIGNMENT INFO */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Assigned To</label>
              {assignedStaff ? (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignedStaff?.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white font-bold">{getInitials(assignedStaff?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-slate-900 truncate">{assignedStaff?.full_name}</p>
                    <p className="text-sm text-slate-500">IT Staff</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center"><p className="text-sm text-slate-400">Not yet assigned</p></div>
              )}
            </div>

            {/* SAVE BUTTON */}
            <Button onClick={handleSaveChanges} disabled={saving} className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition">
              {saving ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving...</span> : <span className="flex items-center gap-2"><Save className="h-4 w-4" />Save Changes</span>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
