import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListOnboardings } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, CheckCircle, Circle, UserCheck } from "lucide-react";

function checklist(o: { offerAccepted?: boolean; documentsUploaded?: boolean; verificationComplete?: boolean; trainingAssigned?: boolean }) {
  return [
    { label: "Offer Accepted", done: !!o.offerAccepted },
    { label: "Documents Uploaded", done: !!o.documentsUploaded },
    { label: "Verification Complete", done: !!o.verificationComplete },
    { label: "Training Assigned", done: !!o.trainingAssigned },
  ];
}

function progressPercent(o: { offerAccepted?: boolean; documentsUploaded?: boolean; verificationComplete?: boolean; trainingAssigned?: boolean }) {
  const items = checklist(o);
  return Math.round((items.filter(i => i.done).length / items.length) * 100);
}

const renderCheckmark = (status: boolean) => {
  return status ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-gray-400" />;
};

export default function Onboarding() {
  const { data: records, isLoading } = useListOnboardings();

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Onboarding Portal</h1>
          <p className="text-muted-foreground mt-1">{records?.length ?? 0} employees in onboarding</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-4">
            {(records ?? []).map((record, i) => {
              const progress = progressPercent(record);
              const items = checklist(record);
              return (
                <motion.div key={record.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/onboarding/${record.id}`}>
                    <div className="glass-panel p-5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                      data-testid={`onboarding-card-${record.id}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                          {record.candidate?.name?.charAt(0) ?? "?"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <span className="font-medium">{record.candidate?.name ?? `Candidate #${record.candidateId}`}</span>
                              <span className="text-xs text-muted-foreground ml-2">· {record.job?.title ?? `Job #${record.jobId}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${progress === 100 ? "text-emerald-400" : "text-primary"}`}>{progress}%</span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-primary"}`}
                            />
                          </div>

                          {/* Checklist pills */}
                          <div className="flex flex-wrap gap-2">
                            {items.map(item => (
                              <span key={item.label} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${
                                item.done
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                  : "text-muted-foreground bg-white/5 border-white/10"
                              }`}>
                                {renderCheckmark(item.done)} {item.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            {(records ?? []).length === 0 && (
              <div className="glass-panel text-center py-16 rounded-xl text-muted-foreground">
                <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No onboarding records yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
