import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListInterviews, useCreateInterview, getListInterviewsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Video, CheckCircle, Clock, Calendar } from "lucide-react";

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  scheduled: { color: "text-blue-400 bg-blue-500/15 border-blue-500/30", icon: Calendar },
  "in-progress": { color: "text-amber-400 bg-amber-500/15 border-amber-500/30", icon: Clock },
  completed: { color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30", icon: CheckCircle },
};

export default function Interviews() {
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: interviews, isLoading } = useListInterviews({ status: statusFilter || undefined });

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading">Interviews</h1>
            <p className="text-muted-foreground mt-1">{interviews?.length ?? 0} interviews</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select className="bg-card border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)} data-testid="select-interview-status">
            <option value="">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-3">
            {(interviews ?? []).map((interview, i) => {
              const config = statusConfig[interview.status] ?? statusConfig.scheduled;
              const StatusIcon = config.icon;
              return (
                <motion.div key={interview.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/interviews/${interview.id}/review`}>
                    <div className="glass-panel p-5 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer"
                      data-testid={`interview-row-${interview.id}`}>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {interview.candidate?.name?.charAt(0) ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{interview.candidate?.name ?? `Candidate #${interview.candidateId}`}</span>
                          <Video className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {interview.job?.title ?? `Job #${interview.jobId}`}
                          {interview.scheduledAt && ` · ${new Date(interview.scheduledAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      {interview.overallScore != null && (
                        <div className="text-center hidden md:block">
                          <div className="text-lg font-bold font-heading text-primary">{interview.overallScore.toFixed(0)}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      )}
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {interview.status}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            {(interviews ?? []).length === 0 && (
              <div className="text-center py-16 text-muted-foreground glass-panel rounded-xl">
                <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No interviews found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
