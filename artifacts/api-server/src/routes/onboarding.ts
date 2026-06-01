import { Router, type IRouter } from "express";
import { onboardingTable, candidatesTable, jobsTable, type Onboarding, type Candidate, type Job } from "@workspace/db";
import {
  ListOnboardingsQueryParams,
  CreateOnboardingBody,
  GetOnboardingParams,
  UpdateOnboardingParams,
  UpdateOnboardingBody,
} from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

function formatOnboarding(row: Onboarding & { candidate?: Candidate | null, job?: Job | null }) {
  return {
    ...row,
    joiningDate: row.joiningDate ? new Date(row.joiningDate).toISOString() : null,
    createdAt: new Date(row.createdAt).toISOString(),
    candidate: row.candidate ? { ...row.candidate, createdAt: new Date(row.candidate.createdAt).toISOString() } : undefined,
    job: row.job ? { ...row.job, createdAt: new Date(row.job.createdAt).toISOString(), applicantCount: 0 } : undefined,
  };
}

router.get("/onboarding", async (req, res): Promise<void> => {
  const parsed = ListOnboardingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { candidateId, status } = parsed.data;

  const rows = onboardingTable.findMany(o => {
    let match = true;
    if (candidateId && o.candidateId !== candidateId) match = false;
    if (status && o.status !== status) match = false;
    return match;
  }).map(o => {
    const candidate = candidatesTable.findFirst(c => c.id === o.candidateId);
    const job = jobsTable.findFirst(j => j.id === o.jobId);
    return { ...o, candidate, job };
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json(rows.map(formatOnboarding));
});

router.post("/onboarding", async (req, res): Promise<void> => {
  const parsed = CreateOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const now = new Date();
  const [onboarding] = onboardingTable.insert({
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : null,
    salary: parsed.data.salary ?? null,
    notes: parsed.data.notes ?? null,
    status: "pending",
    id: Math.floor(Math.random() * 1000000),
    offerAccepted: false,
    documentsUploaded: false,
    verificationComplete: false,
    trainingAssigned: false,
    createdAt: now,
    updatedAt: now
  } as Onboarding);

  const candidate = candidatesTable.findFirst(c => c.id === onboarding.candidateId);
  const job = jobsTable.findFirst(j => j.id === onboarding.jobId);
  res.status(201).json(formatOnboarding({ ...onboarding, candidate: candidate ?? null, job: job ?? null }));
});

router.get("/onboarding/:id", async (req, res): Promise<void> => {
  const params = GetOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const onboarding = onboardingTable.findFirst(o => o.id === params.data.id);
  if (!onboarding) {
    res.status(404).json({ error: "Onboarding record not found" });
    return;
  }
  const candidate = candidatesTable.findFirst(c => c.id === onboarding.candidateId);
  const job = jobsTable.findFirst(j => j.id === onboarding.jobId);

  res.json(formatOnboarding({ ...onboarding, candidate, job }));
});

router.patch("/onboarding/:id", async (req, res): Promise<void> => {
  const params = UpdateOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  
  const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.joiningDate) updateData.joiningDate = new Date(parsed.data.joiningDate);

  const updated = onboardingTable.update(params.data.id, updateData);
  const onboarding = updated[0];
  if (!onboarding) {
    res.status(404).json({ error: "Onboarding record not found" });
    return;
  }
  
  const candidate = candidatesTable.findFirst(c => c.id === onboarding.candidateId);
  const job = jobsTable.findFirst(j => j.id === onboarding.jobId);
  res.json(formatOnboarding({ ...onboarding, candidate: candidate ?? null, job: job ?? null }));
});

export default router;
