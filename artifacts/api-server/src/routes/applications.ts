import { Router, type IRouter } from "express";
import { applicationsTable, candidatesTable, jobsTable, type Application, type Candidate, type Job } from "@workspace/db";
import crypto from "crypto";
import {
  ListApplicationsQueryParams,
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationParams,
  UpdateApplicationBody,
  GetRankedApplicationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatApp(row: Application & { candidate?: Candidate | null, job?: Job | null }) {
  return {
    ...row,
    createdAt: new Date(row.createdAt).toISOString(),
    candidate: row.candidate
      ? { ...row.candidate, createdAt: new Date(row.candidate.createdAt).toISOString() }
      : undefined,
    job: row.job
      ? { ...row.job, createdAt: new Date(row.job.createdAt).toISOString(), applicantCount: 0 }
      : undefined,
  };
}

router.get("/applications", async (req, res): Promise<void> => {
  const parsed = ListApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { jobId, candidateId, status } = parsed.data;

  const rows = applicationsTable.findMany(app => {
    let match = true;
    if (jobId && app.jobId !== jobId) match = false;
    if (candidateId && app.candidateId !== candidateId) match = false;
    if (status && app.status !== status) match = false;
    return match;
  }).map(app => {
    const candidate = candidatesTable.findFirst(c => c.id === app.candidateId);
    const job = jobsTable.findFirst(j => j.id === app.jobId);
    return { ...app, candidate, job };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(rows.map(formatApp));
});

router.get("/applications/ranked", async (req, res): Promise<void> => {
  const parsed = GetRankedApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { jobId } = parsed.data;
  
  const rows = applicationsTable.findMany(app => app.jobId === jobId)
    .map(app => {
      const candidate = candidatesTable.findFirst(c => c.id === app.candidateId);
      return { ...app, candidate };
    });

  const ranked = rows
    .map((r, i) => {
      const candidateSkills = r.candidate?.skills ?? [];
      const score = r.candidate?.finalScore ?? r.matchScore ?? (50 + Math.random() * 40);
      let recommendation: string | null = null;
      if (score >= 90) recommendation = "Strong Hire";
      else if (score >= 80) recommendation = "Hire";
      else if (score >= 65) recommendation = "Maybe";
      else recommendation = "Reject";
      return {
        ...r,
        finalScore: Math.round(score * 10) / 10,
        rank: 0,
        recommendation,
        createdAt: new Date(r.createdAt).toISOString(),
        candidate: r.candidate ? { ...r.candidate, createdAt: new Date(r.candidate.createdAt).toISOString() } : undefined,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  res.json(ranked);
});

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const now = new Date();
  const [app] = applicationsTable.insert({
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    coverLetter: parsed.data.coverLetter ?? null,
    notes: parsed.data.notes ?? null,
    status: "applied",
    id: Math.floor(Math.random() * 1000000),
    matchScore: null,
    resumeScore: null,
    createdAt: now,
    updatedAt: now
  } as Application);

  const candidate = candidatesTable.findFirst(c => c.id === app.candidateId);
  const job = jobsTable.findFirst(j => j.id === app.jobId);
  res.status(201).json(formatApp({ ...app, candidate: candidate ?? null, job: job ?? null }));
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const app = applicationsTable.findFirst(a => a.id === params.data.id);
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  
  const candidate = candidatesTable.findFirst(c => c.id === app.candidateId);
  const job = jobsTable.findFirst(j => j.id === app.jobId);

  res.json(formatApp({ ...app, candidate, job }));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  const updateData = { ...parsed.data, updatedAt: new Date() } as Partial<Application>;
  const updated = applicationsTable.update(params.data.id, updateData);
  
  const app = updated[0];
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  const candidate = candidatesTable.findFirst(c => c.id === app.candidateId);
  const job = jobsTable.findFirst(j => j.id === app.jobId);
  res.json(formatApp({ ...app, candidate, job }));
});

export default router;
