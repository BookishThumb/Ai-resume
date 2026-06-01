import { useState } from "react";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { useRoute, Link } from "wouter";
import { useGetInterview, useUpdateInterview, useAnalyzeInterview, getGetInterviewQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Brain, BarChart2 } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function InterviewDetail() {
  const [, params] = useRoute("/interviews/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: interview, isLoading } = useGetInterview(id, { query: { enabled: !!id, queryKey: getGetInterviewQueryKey(id) } });
  const analyzeInterview = useAnalyzeInterview();
  const updateInterview = useUpdateInterview();

  const handleAnalyze = () => {
    const text = transcript || interview?.transcript || "";
    if (!text.trim()) {
      toast({ title: "Please enter a transcript first", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    analyzeInterview.mutate({ id, data: { transcript: text } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInterviewQueryKey(id) });
        toast({ title: "Interview analyzed successfully" });
        setAnalyzing(false);
      },
      onError: () => { toast({ title: "Analysis failed", variant: "destructive" }); setAnalyzing(false); },
    });
  };

  if (isLoading) return <Layout><div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div></Layout>;
  if (!interview) return <Layout><div className="p-8 text-muted-foreground">Interview not found</div></Layout>;

  const scores = interview.overallScore != null ? [
    { dimension: "Technical", value: interview.technicalScore ?? 0 },
    { dimension: "Communication", value: interview.communicationScore ?? 0 },
    { dimension: "Relevance", value: interview.relevanceScore ?? 0 },
    { dimension: "Confidence", value: interview.confidenceScore ?? 0 },
    { dimension: "Problem Solving", value: interview.problemSolvingScore ?? 0 },
  ] : [];

  const scoreFormula = interview.overallScore != null
    ? `0.35×${interview.technicalScore?.toFixed(0)} + 0.25×${interview.communicationScore?.toFixed(0)} + 0.20×${interview.relevanceScore?.toFixed(0)} + 0.10×${interview.confidenceScore?.toFixed(0)} + 0.10×${interview.problemSolvingScore?.toFixed(0)} = ${interview.overallScore.toFixed(1)}`
    : null;

  return (
    <Layout>
      <div className="p-8 max-w-5xl">
        <Link href="/interviews">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Interviews
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-6 rounded-xl">
              <h1 className="text-xl font-bold font-heading mb-1">Interview</h1>
              <p className="text-muted-foreground text-sm">{interview.candidate?.name} · {interview.job?.title}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium ${interview.status === "completed" ? "text-emerald-400" : "text-blue-400"}`}>
                    {interview.status}
                  </span>
                </div>
                {interview.scheduledAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span>{new Date(interview.scheduledAt).toLocaleDateString()}</span>
                  </div>
                )}
                {interview.overallScore != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overall Score</span>
                    <span className="font-bold text-primary text-lg">{interview.overallScore.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Score Radar */}
            {scores.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  <h2 className="font-semibold text-sm">Score Breakdown</h2>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={scores}>
                    <PolarGrid stroke="#ffffff10" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
                {scoreFormula && (
                  <p className="text-xs text-muted-foreground text-center mt-2 font-mono">{scoreFormula}</p>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {scores.map(s => (
                    <div key={s.dimension} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span className="text-xs text-muted-foreground">{s.dimension}</span>
                      <span className={`text-sm font-bold ${s.value >= 80 ? "text-emerald-400" : s.value >= 65 ? "text-amber-400" : "text-red-400"}`}>
                        {s.value.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {interview.aiNotes && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm">AI Notes</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{interview.aiNotes}</p>
              </motion.div>
            )}
          </div>

          {/* Right: Transcript & Analyze */}
          <div className="space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-panel p-6 rounded-xl">
              <h2 className="font-semibold mb-3">Interview Transcript</h2>
              <Textarea
                placeholder="Paste the interview transcript here to run AI analysis..."
                rows={12}
                value={transcript || interview.transcript || ""}
                onChange={e => setTranscript(e.target.value)}
                className="resize-none font-mono text-sm"
                data-testid="input-transcript"
              />
              <Button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="mt-4 gap-2 w-full"
                data-testid="button-analyze-interview"
              >
                <Brain className="w-4 h-4" />
                {analyzing ? "Analyzing..." : "Analyze with AI"}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
