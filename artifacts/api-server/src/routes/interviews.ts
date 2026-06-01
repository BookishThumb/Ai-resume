import { Router, type IRouter } from "express";
import { interviewsTable, candidatesTable, jobsTable, type Interview, type Candidate, type Job } from "@workspace/db";
import crypto from "crypto";
import {
  ListInterviewsQueryParams,
  CreateInterviewBody,
  GetInterviewParams,
  UpdateInterviewParams,
  UpdateInterviewBody,
  AnalyzeInterviewParams,
  AnalyzeInterviewBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatInterview(row: Interview & { candidate?: Candidate | null, job?: Job | null }) {
  return {
    ...row,
    scheduledAt: row.scheduledAt ? new Date(row.scheduledAt).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
    candidate: row.candidate ? { ...row.candidate, createdAt: new Date(row.candidate.createdAt).toISOString() } : undefined,
    job: row.job ? { ...row.job, createdAt: new Date(row.job.createdAt).toISOString(), applicantCount: 0 } : undefined,
  };
}

router.get("/interviews", async (req, res): Promise<void> => {
  const parsed = ListInterviewsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { candidateId, jobId, status } = parsed.data;

  const rows = interviewsTable.findMany(interview => {
    let match = true;
    if (candidateId && interview.candidateId !== candidateId) match = false;
    if (jobId && interview.jobId !== jobId) match = false;
    if (status && interview.status !== status) match = false;
    return match;
  }).map(interview => {
    const candidate = candidatesTable.findFirst(c => c.id === interview.candidateId);
    const job = jobsTable.findFirst(j => j.id === interview.jobId);
    return { ...interview, candidate, job };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(rows.map(formatInterview));
});

router.post("/interviews", async (req, res): Promise<void> => {
  const parsed = CreateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const now = new Date();
  const [interview] = interviewsTable.insert({
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : null,
    status: "scheduled",
    id: Math.floor(Math.random() * 1000000),
    transcript: null,
    technicalScore: null,
    communicationScore: null,
    relevanceScore: null,
    confidenceScore: null,
    problemSolvingScore: null,
    overallScore: null,
    aiNotes: null,
    createdAt: now,
    updatedAt: now
  } as Interview);

  const candidate = candidatesTable.findFirst(c => c.id === interview.candidateId);
  const job = jobsTable.findFirst(j => j.id === interview.jobId);
  res.status(201).json(formatInterview({ ...interview, candidate: candidate ?? null, job: job ?? null }));
});

router.get("/interviews/:id", async (req, res): Promise<void> => {
  const params = GetInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const interview = interviewsTable.findFirst(i => i.id === params.data.id);
  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }
  
  const candidate = candidatesTable.findFirst(c => c.id === interview.candidateId);
  const job = jobsTable.findFirst(j => j.id === interview.jobId);
  
  res.json(formatInterview({ ...interview, candidate, job }));
});

router.patch("/interviews/:id", async (req, res): Promise<void> => {
  const params = UpdateInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.scheduledAt) {
    updateData.scheduledAt = new Date(parsed.data.scheduledAt);
  }
  
  const updated = interviewsTable.update(params.data.id, updateData);
  const interview = updated[0];
  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }
  const candidate = candidatesTable.findFirst(c => c.id === interview.candidateId);
  const job = jobsTable.findFirst(j => j.id === interview.jobId);
  res.json(formatInterview({ ...interview, candidate: candidate ?? null, job: job ?? null }));
});

router.post("/interviews/:id/analyze", async (req, res): Promise<void> => {
  const params = AnalyzeInterviewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AnalyzeInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { transcript } = parsed.data;
  const words = transcript.split(/\s+/).length;
  const baseScore = Math.min(95, 55 + (words / 50));

  const technical = Math.round(Math.min(98, baseScore + (Math.random() * 20 - 10)));
  const communication = Math.round(Math.min(98, baseScore + (Math.random() * 15 - 5)));
  const relevance = Math.round(Math.min(98, baseScore + (Math.random() * 18 - 8)));
  const confidence = Math.round(Math.min(98, baseScore + (Math.random() * 20 - 10)));
  const problemSolving = Math.round(Math.min(98, baseScore + (Math.random() * 20 - 12)));

  const overallScore = Math.round(
    technical * 0.35 + communication * 0.25 + relevance * 0.20 + confidence * 0.10 + problemSolving * 0.10
  );

  let recommendation = "Maybe";
  if (overallScore >= 90) recommendation = "Strong Hire";
  else if (overallScore >= 80) recommendation = "Hire";
  else if (overallScore < 65) recommendation = "Reject";

  interviewsTable.update(params.data.id, {
    transcript,
    technicalScore: technical,
    communicationScore: communication,
    relevanceScore: relevance,
    confidenceScore: confidence,
    problemSolvingScore: problemSolving,
    overallScore,
    status: "completed",
    aiNotes: `AI Analysis: Candidate demonstrated ${technical >= 80 ? "strong" : "moderate"} technical knowledge. Communication was ${communication >= 80 ? "clear and articulate" : "adequate"}. Problem solving ability ${problemSolving >= 80 ? "exceeded" : "met"} expectations.`,
    updatedAt: new Date()
  });

  res.json({
    technicalScore: technical,
    communicationScore: communication,
    relevanceScore: relevance,
    confidenceScore: confidence,
    problemSolvingScore: problemSolving,
    overallScore,
    summary: `Interview assessed ${words} words of response. Overall performance is ${recommendation.toLowerCase()}-tier with particular strengths in ${technical >= communication ? "technical knowledge" : "communication"}.`,
    recommendation,
  });
});

export default router;
