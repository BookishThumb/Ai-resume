import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link, useRoute } from "wouter";
import { useGetJob, useGetRankedApplications, getGetRankedApplicationsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ScoreBadge, { ScoreRing } from "@/components/ScoreBadge";
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Briefcase } from "lucide-react";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = parseInt(params?.id ?? "0", 10);

  const { data: job, isLoading: jobLoading } = useGetJob(id, { query: { enabled: !!id, queryKey: [["jobs", id]] } });
  const { data: ranked, isLoading: rankedLoading } = useGetRankedApplications(
    { jobId: id },
    { query: { enabled: !!id, queryKey: getGetRankedApplicationsQueryKey({ jobId: id }) } }
  );

  if (jobLoading) return <Layout><div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div></Layout>;
  if (!job) return <Layout><div className="p-8 text-muted-foreground">Job not found</div></Layout>;

  return (
    <Layout>
      <div className="p-8 max-w-5xl">
        <Link href="/jobs">
          <Button variant="ghost" size="sm" className="gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Back to Jobs</Button>
        </Link>

        {/* Job Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading mb-2" data-testid="text-job-title">{job.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>}
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{job.employmentType}</span>
                {(job.salaryMin || job.salaryMax) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.salaryMin && job.salaryMax
                      ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
                      : `$${((job.salaryMin ?? job.salaryMax ?? 0) / 1000).toFixed(0)}k`}
                  </span>
                )}
                <span className="flex items-center gap-1 text-primary font-medium"><Users className="w-4 h-4" />{job.applicantCount} applicants</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${job.status === "open" ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" : "text-red-400 bg-red-500/15 border-red-500/30"}`}>
              {job.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{job.description}</p>
          {(job.requiredSkills?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {(job.requiredSkills || []).map((s, index) => (
                <Badge key={index} variant="secondary" className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">{s}</Badge>
              ))}
            </div>
          )}
        </motion.div>

        {/* Ranked Applicants */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-6 rounded-xl">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Ranked Applicants</h2>
          {rankedLoading ? <Skeleton className="h-48 w-full" /> : (
            <div className="space-y-3">
              {(ranked ?? []).map((app, i) => (
                <motion.div key={app.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/candidates/${app.candidateId}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5"
                      data-testid={`ranked-app-${app.id}`}>
                      <div className="text-2xl font-bold font-heading text-muted-foreground w-8 text-center">#{app.rank}</div>
                      <ScoreRing score={app.finalScore} size={52} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{app.candidate?.name ?? "Unknown"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{app.candidate?.skills?.slice(0, 3).join(", ")}</div>
                      </div>
                      <div className="text-center text-xs text-muted-foreground">
                        <div className="font-medium text-foreground">{app.candidate?.experience ?? 0}yr</div>
                        <div>experience</div>
                      </div>
                      <ScoreBadge recommendation={app.recommendation} />
                      <span className={`px-2 py-1 rounded-md text-xs border ${
                        app.status === "hired" ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" :
                        app.status === "rejected" ? "text-red-400 bg-red-500/15 border-red-500/30" :
                        "text-muted-foreground bg-muted/20 border-muted/30"
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {(ranked ?? []).length === 0 && (
                <p className="text-center text-muted-foreground py-8">No applicants yet for this position</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
