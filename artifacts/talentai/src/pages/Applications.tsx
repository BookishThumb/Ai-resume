import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListApplications, useUpdateApplication, getListApplicationsQueryKey, getListCandidatesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreBadge from "@/components/ScoreBadge";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight } from "lucide-react";

const STAGES = ["applied", "shortlisted", "interviewed", "offered", "hired", "rejected"];

const stageColors: Record<string, { bg: string; border: string; title: string }> = {
  applied:     { bg: "bg-blue-500/10",   border: "border-blue-500/20",   title: "Applied" },
  shortlisted: { bg: "bg-violet-500/10", border: "border-violet-500/20", title: "Shortlisted" },
  interviewed: { bg: "bg-amber-500/10",  border: "border-amber-500/20",  title: "Interviewed" },
  offered:     { bg: "bg-cyan-500/10",   border: "border-cyan-500/20",   title: "Offered" },
  hired:       { bg: "bg-emerald-500/10",border: "border-emerald-500/20",title: "Hired" },
  rejected:    { bg: "bg-red-500/10",    border: "border-red-500/20",    title: "Rejected" },
};

export default function Applications() {
  const [viewMode] = useState<"kanban" | "list">("list");
  const { data: applications, isLoading } = useListApplications();
  const updateApplication = useUpdateApplication();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateApplication.mutate({ id, data: { status } }, {
      onSuccess: () => {
        // Invalidate both applications and candidates caches so both sides update immediately
        queryClient.invalidateQueries({ queryKey: getListApplicationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCandidatesQueryKey() });
        toast({ title: `Status updated to ${status}` });
      },
    });
  };

  const byStage = STAGES.reduce<Record<string, typeof applications>>((acc, s) => {
    acc[s] = (applications ?? []).filter(a => a.status === s);
    return acc;
  }, {});

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Applications Pipeline</h1>
          <p className="text-muted-foreground mt-1">{applications?.length ?? 0} total applications</p>
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : (
          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Applied</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(applications ?? []).map((app, i) => (
                  <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/5 transition-colors" data-testid={`application-row-${app.id}`}>
                    <td className="py-3 px-4">
                      <Link href={`/candidates/${app.candidateId}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {app.candidate?.name?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <div className="font-medium text-sm hover:text-primary transition-colors">{app.candidate?.name ?? "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{app.candidate?.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      <Link href={`/jobs/${app.jobId}`} className="hover:text-primary transition-colors">
                        {app.job?.title ?? `Job #${app.jobId}`}
                      </Link>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {app.matchScore != null
                        ? <ScoreBadge score={app.matchScore} size="sm" />
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer ${
                          stageColors[app.status]?.bg ?? ""} ${stageColors[app.status]?.border ?? ""} bg-transparent`}
                        value={app.status}
                        onChange={e => handleStatusChange(app.id, e.target.value)}
                        data-testid={`select-app-status-${app.id}`}
                      >
                        {STAGES.map(s => <option key={s} value={s} className="bg-card">{stageColors[s].title}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground hidden md:table-cell">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/candidates/${app.candidateId}`}>
                        <button className="p-1 hover:text-primary text-muted-foreground transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {(applications ?? []).length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p>No applications yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
