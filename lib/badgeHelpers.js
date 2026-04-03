import { Badge } from "@/components/ui/badge";

export function getPriorityBadge(priority) {
  switch (priority?.toLowerCase()) {
    case "critical":
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          Critical
        </Badge>
      );
    case "high":
      return (
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          Low
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-full">
          {priority || "Unknown"}
        </Badge>
      );
  }
}

export function getStatusBadge(status) {
  switch (status?.toLowerCase()) {
    case "open":
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          Open
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          In Progress
        </Badge>
      );
    case "resolved":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          Resolved
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20 shadow-none font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-lg">
          {status || "Unknown"}
        </Badge>
      );
  }
}
