import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useGetAnalyticsSummary, useGetHiringFunnel, useGetApplicationsOverTime, useGetTopCandidates } from "@workspace/api-client-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ScoreBadge from "@/components/ScoreBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Briefcase, CheckCircle, Clock, Target } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummary();
  const { data: funnel, isLoading: funnelLoading } = useGetHiringFunnel();
  const { data: overtime } = useGetApplicationsOverTime();
  const { data: topCandidates } = useGetTopCandidates({ limit: 5 });

  const stats = [
    { label: "Total Applicants", value: summary?.totalApplicants ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Shortlisted", value: summary?.shortlisted ?? 0, icon: Target, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Interviewed", value: summary?.interviewed ?? 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Hired", value: summary?.hired ?? 0, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Success Rate", value: `${summary?.hiringSuccessRate ?? 0}%`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Jobs", value: summary?.activeJobs ?? 0, icon: Briefcase, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  ];

  const funnelColors = ["#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"];
  const lastWeek = (overtime ?? []).slice(-14);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Recruitment pipeline overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="glass-panel p-5 rounded-xl"
              data-testid={`stat-card-${s.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              {summaryLoading ? (
                <Skeleton className="h-8 w-16 mb-1" />
              ) : (
                <div className={`text-2xl font-bold font-heading ${s.color}`}>{s.value}</div>
              )}
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hiring Funnel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel p-6 rounded-xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Hiring Funnel</h2>
            {funnelLoading ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnel ?? []} layout="vertical">
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="stage" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {(funnel ?? []).map((_, i) => (
                      <Cell key={i} fill={funnelColors[i % funnelColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Applications Over Time */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="glass-panel p-6 rounded-xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Applications (Last 14 Days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lastWeek}>
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Candidates */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Candidates</h2>
            <Link href="/candidates" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {!topCandidates ? <Skeleton className="h-32 w-full" /> : (
            <div className="space-y-3">
              {topCandidates.map((c, i) => (
                <Link key={c.id} href={`/candidates/${c.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    data-testid={`top-candidate-${c.id}`}>
                    <div className="w-6 text-center text-sm font-bold text-muted-foreground">#{i + 1}</div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.skills?.slice(0, 3).join(", ")}</div>
                    </div>
                    <ScoreBadge score={c.finalScore} recommendation={c.recommendation} size="sm" />
                  </div>
                </Link>
              ))}
              {topCandidates.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-4">No scored candidates yet</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
