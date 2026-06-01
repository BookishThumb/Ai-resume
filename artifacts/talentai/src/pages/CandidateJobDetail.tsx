import { useState } from "react";
import CandidateLayout from "@/components/CandidateLayout";
import CandidateApplyModal from "@/components/CandidateApplyModal";
import { motion } from "framer-motion";
import { Link, useRoute } from "wouter";
import { useGetJob } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase } from "lucide-react";

export default function CandidateJobDetail() {
  const [, params] = useRoute("/find-jobs/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const { data: job, isLoading: jobLoading } = useGetJob(id, { query: { enabled: !!id, queryKey: [["jobs", id]] } });

  if (jobLoading) return <CandidateLayout><div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div></CandidateLayout>;
  if (!job) return <CandidateLayout><div className="p-8 text-muted-foreground">Job not found</div></CandidateLayout>;

  return (
    <CandidateLayout>
      <div className="p-8 max-w-5xl">
        <Link href="/find-jobs">
          <Button variant="ghost" size="sm" className="gap-2 mb-6"><ArrowLeft className="w-4 h-4" /> Back to Jobs</Button>
        </Link>

        {/* Job Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold font-heading mb-2">{job.title}</h1>
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
              </div>
            </div>
            <Button onClick={() => setApplyModalOpen(true)}>Apply Now</Button>
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

        <CandidateApplyModal jobId={id} open={applyModalOpen} onOpenChange={setApplyModalOpen} />
      </div>
    </CandidateLayout>
  );
}
