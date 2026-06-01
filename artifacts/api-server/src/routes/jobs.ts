import { Router, type IRouter } from "express";
import { jobsTable, applicationsTable, type Job } from "@workspace/db";
import crypto from "crypto";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  UpdateJobParams,
  UpdateJobBody,
  DeleteJobParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatJob(j: Job) {
  const applicantCount = applicationsTable.findMany(a => a.jobId === j.id).length;
  return {
    ...j,
    applicantCount,
    createdAt: new Date(j.createdAt).toISOString(),
  };
}

router.get("/jobs", async (req, res): Promise<void> => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, search, location, employmentType } = parsed.data;

  const jobs = jobsTable.findMany(j => {
    let match = true;
    if (status && j.status !== status) match = false;
    if (location && !j.location?.toLowerCase().includes(location.toLowerCase())) match = false;
    if (employmentType && j.employmentType !== employmentType) match = false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) match = false;
    return match;
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json(jobs.map(formatJob));
});

router.post("/jobs", async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const now = new Date();
  const [job] = jobsTable.insert({
    ...parsed.data,
    id: Math.floor(Math.random() * 1000000),
    requiredSkills: parsed.data.requiredSkills ?? [],
    status: parsed.data.status ?? "open",
    employmentType: parsed.data.employmentType,
    description: parsed.data.description ?? "",
    experience: parsed.data.experience ?? "",
    salaryMin: parsed.data.salaryMin ?? 0,
    salaryMax: parsed.data.salaryMax ?? 0,
    location: parsed.data.location ?? "",
    createdAt: now,
    updatedAt: now
  } as Job);
  
  res.status(201).json(formatJob(job));
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const row = jobsTable.findFirst(j => j.id === params.data.id);

  if (!row) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(formatJob(row));
});

router.patch("/jobs/:id", async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData = { ...parsed.data, updatedAt: new Date() } as Partial<Job>;
  const updated = jobsTable.update(params.data.id, updateData);
  const job = updated[0];
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json(formatJob(job));
});

router.delete("/jobs/:id", async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const job = jobsTable.findFirst(j => j.id === params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  jobsTable.delete(params.data.id);
  res.sendStatus(204);
});

export default router;
