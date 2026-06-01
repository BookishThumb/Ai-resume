import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useListCandidates, getListCandidatesQueryKey } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ScoreBadge from "@/components/ScoreBadge";
import { Search, MapPin, Briefcase } from "lucide-react";

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data: candidates, isLoading } = useListCandidates({ search: search || undefined, status: status || undefined });

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading">Candidate Database</h1>
          <p className="text-muted-foreground mt-1">{candidates?.length ?? 0} candidates</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search candidates..." className="pl-10" value={search}
              onChange={e => setSearch(e.target.value)} data-testid="input-search-candidates" />
          </div>
          <select className="bg-card border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground"
            value={status} onChange={e => setStatus(e.target.value)} data-testid="select-candidate-status">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Candidates Table */}
        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : (
          <div className="glass-panel rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Candidate</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Skills</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Location</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Exp.</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(candidates ?? []).map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/5 transition-colors cursor-pointer" data-testid={`candidate-row-${c.id}`}>
                    <td className="py-3 px-4">
                      <Link href={`/candidates/${c.id}`} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/20 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                          {c.name.charAt(0)}{c.name.split(" ")[1]?.charAt(0) ?? ""}
                        </div>
                        <div>
                          <div className="font-medium text-sm hover:text-primary transition-colors">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {c.skills?.slice(0, 3).map(s => (
                          <span key={s} className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      {c.location ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span> : "—"}
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      {c.experience != null ? `${c.experience}yr` : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {c.finalScore != null
                        ? <ScoreBadge score={c.finalScore} recommendation={c.recommendation} size="sm" />
                        : <span className="text-xs text-muted-foreground">Pending</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${
                        c.status === "hired" ? "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" :
                        c.status === "rejected" ? "text-red-400 bg-red-500/15 border-red-500/30" :
                        "text-blue-400 bg-blue-500/15 border-blue-500/30"
                      }`}>{c.status}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {(candidates ?? []).length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No candidates found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

