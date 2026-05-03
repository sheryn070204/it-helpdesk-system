// Import the Badge component to style our labels
import { Badge } from "@/components/ui/badge";

// This function gives back a colored label based on how urgent the ticket is
export function getPriorityBadge(priority) {
  // Check the priority level and pick a color
  switch (priority?.toLowerCase()) {
    case "critical":
      // If it's critical, show a red label
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          Critical
        </Badge>
      );
    case "high":
      // If it's high, show an orange label
      return (
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          High
        </Badge>
      );
    case "medium":
      // If it's medium, show a yellow label
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          Medium
        </Badge>
      );
    case "low":
      // If it's low, show a green label
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          Low
        </Badge>
      );
    default:
      // If we don't know the priority, show a grey label
      return (
        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          {priority || "Unknown"}
        </Badge>
      );
  }
}

// This function gives back a colored label based on the ticket's current status
export function getStatusBadge(status) {
  // Check the status and pick a color
  switch (status?.toLowerCase()) {
    case "open":
      // If it's open, show a blue label
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          Open
        </Badge>
      );
    case "in_progress":
      // If it's being worked on, show a yellow label
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          In Progress
        </Badge>
      );
    case "resolved":
      // If it's finished, show a green label
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          Resolved
        </Badge>
      );
    default:
      // If we don't know the status, show a grey label
      return (
        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          {status || "Unknown"}
        </Badge>
      );
  }
}
