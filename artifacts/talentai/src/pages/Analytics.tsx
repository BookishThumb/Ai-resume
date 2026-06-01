import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import {
  useGetAnalyticsSummary, useGetHiringFunnel, useGetApplicationsOverTime, useGetSkillDistribution, useGetTopCandidates
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreBadge from "@/components/ScoreBadge";
import { Link } from "wouter";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, AreaChart, Area
} from "recharts";
import { TrendingUp, Users, Briefcase, CheckCircle, Clock, Target } from "lucide-react";

const COLORS = ["#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

export default function Analytics() {
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummary();
  const { data: funnel } = useGetHiringFunnel();
  const { data: overtime } = useGetApplicationsOverTime();
  const { data: skills } = useGetSkillDistribution();
  const { data: topCandidates } = useGetTopCandidates({ limit: 10 });

  const stats = [
    { label: "Total Applicants", value: summary?.totalApplicants, color: "text-blue-400", bg: "bg-blue-500/10", icon: Users },
    { label: "Shortlisted", value: summary?.shortlisted, color: "text-violet-400", bg: "bg-violet-500/10", icon: Target },
    { label: "Interviewed", value: summary?.interviewed, color: "text-amber-400", bg: "bg-amber-500/10", icon: Clock },
    { label: "Hired", value: summary?.hired, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
    { label: "Rejected", value: summary?.rejected, color: "text-red-400", bg: "bg-red-500/10", icon: Users },
    { label: "Active Jobs", value: summary?.activeJobs, color: "text-cyan-400", bg: "bg-cyan-500/10", icon: Briefcase },
    { label: "Success Rate", value: `${summary?.hiringSuccessRate ?? 0}%`, color: "text-primary", bg: "bg-primary/10", icon: TrendingUp },
    { label: "Avg Days to Hire", value: `${summary?.avgTimeToHire ?? 0}d`, color: "text-pink-400", bg: "bg-pink-500/10", icon: Clock },
  ];

  const last30 = (overtime ?? []).slice(-30);
  const top10Skills = (skills ?? []).slice(0, 10);

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Analytics</h1>
          <p className="text-muted-foreground mt-1">Platform-wide recruitment metrics</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }} className="glass-panel p-4 rounded-xl" data-testid={`analytics-stat-${s.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              {summaryLoading ? <Skeleton className="h-7 w-12" /> : (
                <div className={`text-xl font-bold font-heading ${s.color}`}>{s.value ?? 0}</div>
              )}
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Applications Over Time */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel p-6 rounded-xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Applications Over Time (30 Days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={last30}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v.slice(5)} interval={4} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }}
                  labelStyle={{ color: "#e2e8f0" }} />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Hiring Funnel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-panel p-6 rounded-xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Hiring Funnel</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={funnel ?? []} layout="vertical">
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {(funnel ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Skill Distribution */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel p-6 rounded-xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Top Skills Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top10Skills}>
                <XAxis dataKey="skill" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {top10Skills.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Candidates Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-panel p-6 rounded-xl">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Candidate Leaderboard</h2>
            <div className="space-y-2.5">
              {(topCandidates ?? []).map((c, i) => (
                <Link key={c.id} href={`/candidates/${c.id}`}>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" data-testid={`leaderboard-candidate-${c.id}`}>
                    <div className={`w-6 text-center text-xs font-bold ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-400" : i === 2 ? "text-orange-700" : "text-muted-foreground"}`}>
                      #{i + 1}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {c.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.skills?.slice(0, 2).join(", ")}</div>
                    </div>
                    <ScoreBadge score={c.finalScore} recommendation={c.recommendation} size="sm" />
                  </div>
                </Link>
              ))}
              {(!topCandidates || topCandidates.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-6">No scored candidates yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
