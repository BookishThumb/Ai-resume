import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListJobs, useDeleteJob, getListJobsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MapPin, Clock, DollarSign, Users, Trash2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  open: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  closed: "text-red-400 bg-red-500/15 border-red-500/30",
  paused: "text-amber-400 bg-amber-500/15 border-amber-500/30",
};

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: jobs, isLoading } = useListJobs({ search: search || undefined, status: status || undefined });
  const deleteJob = useDeleteJob();

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteJob.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListJobsQueryKey() });
        toast({ title: "Job deleted" });
      },
    });
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading">Job Openings</h1>
            <p className="text-muted-foreground mt-1">{jobs?.length ?? 0} positions</p>
          </div>
          <Link href="/jobs/new">
            <Button className="gap-2" data-testid="button-create-job">
              <Plus className="w-4 h-4" /> New Job
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search jobs..." className="pl-10" value={search}
              onChange={e => setSearch(e.target.value)} data-testid="input-search-jobs" />
          </div>
          <select
            className="bg-card border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground"
            value={status}
            onChange={e => setStatus(e.target.value)}
            data-testid="select-job-status"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {(jobs ?? []).map((job, i) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -2 }}
                  className="glass-panel p-6 rounded-xl cursor-pointer group h-full"
                  data-testid={`job-card-${job.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{job.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium mt-1 ${statusColor[job.status] ?? statusColor.open}`}>
                        {job.status}
                      </span>
                    </div>
                    <button
                      onClick={e => handleDelete(job.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 text-muted-foreground transition-all"
                      data-testid={`button-delete-job-${job.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.description}</p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {job.location && <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</div>}
                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{job.employmentType}</div>
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salaryMin && job.salaryMax
                          ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k`
                          : `$${((job.salaryMin ?? job.salaryMax ?? 0) / 1000).toFixed(0)}k`}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <Users className="w-3.5 h-3.5" />{job.applicantCount} applicants
                    </div>
                  </div>
                  {(job.requiredSkills?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {(job.requiredSkills || []).slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {(job.requiredSkills?.length ?? 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(job.requiredSkills?.length ?? 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </motion.div>
              </Link>
            ))}
            {jobs?.length === 0 && (
              <div className="col-span-3 text-center py-16 text-muted-foreground">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No jobs found. Create your first job opening.</p>
                <Link href="/jobs/new">
                  <Button className="mt-4 gap-2"><Plus className="w-4 h-4" />New Job</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

