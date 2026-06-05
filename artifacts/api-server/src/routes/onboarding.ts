import { Router, type IRouter } from "express";
import { db, onboardingTable, candidatesTable, jobsTable, type Onboarding, type Candidate, type Job } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ListOnboardingsQueryParams,
  CreateOnboardingBody,
  GetOnboardingParams,
  UpdateOnboardingParams,
  UpdateOnboardingBody,
} from "@workspace/api-zod";
import multer from "multer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { onboardingDocumentsTable } from "@workspace/db";

const upload = multer({ dest: "uploads/documents/" });
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

  const conditions = [];
  if (candidateId) conditions.push(eq(onboardingTable.candidateId, candidateId));
  if (status) conditions.push(eq(onboardingTable.status, status as any));

  const onboardings = await db.select().from(onboardingTable).where(conditions.length > 0 ? and(...conditions) : undefined);
  onboardings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const rows = await Promise.all(onboardings.map(async (o: any) => {
    const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, o.candidateId));
    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, o.jobId));
    return { ...o, candidate: candidate as Candidate, job: job as Job };
  }));

  res.json(rows.map(formatOnboarding));
});

router.post("/onboarding", async (req, res): Promise<void> => {
  const parsed = CreateOnboardingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const insertData: any = {
    candidateId: parsed.data.candidateId,
    jobId: parsed.data.jobId,
    joiningDate: parsed.data.joiningDate ? new Date(parsed.data.joiningDate) : null,
    salary: parsed.data.salary ?? null,
    notes: parsed.data.notes ?? null,
    status: "pending",
  };
  const [onboarding] = await db.insert(onboardingTable).values(insertData).returning();

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, onboarding.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, onboarding.jobId));
  res.status(201).json(formatOnboarding({ ...onboarding, candidate: candidate as Candidate ?? null, job: job as Job ?? null }));
});

router.get("/onboarding/:id", async (req, res): Promise<void> => {
  const params = GetOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const [onboarding] = await db.select().from(onboardingTable).where(eq(onboardingTable.id, params.data.id));
  if (!onboarding) {
    res.status(404).json({ error: "Onboarding record not found" });
    return;
  }
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, onboarding.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, onboarding.jobId));

  res.json(formatOnboarding({ ...onboarding, candidate: candidate as Candidate, job: job as Job }));
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
  
  const updateData: any = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.joiningDate) updateData.joiningDate = new Date(parsed.data.joiningDate);

  const [onboarding] = await db.update(onboardingTable)
    .set(updateData)
    .where(eq(onboardingTable.id, params.data.id))
    .returning();
    
  if (!onboarding) {
    res.status(404).json({ error: "Onboarding record not found" });
    return;
  }
  
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, onboarding.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, onboarding.jobId));
  res.json(formatOnboarding({ ...onboarding, candidate: candidate as Candidate ?? null, job: job as Job ?? null }));
});

// Document Endpoints

router.get("/onboarding/:id/documents", async (req, res): Promise<void> => {
  const params = GetOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  
  const docs = await db.select().from(onboardingDocumentsTable).where(eq(onboardingDocumentsTable.onboardingId, params.data.id));
  res.json(docs.map(d => ({
    ...d,
    uploadedAt: new Date(d.uploadedAt).toISOString()
  })));
});

router.post("/onboarding/:id/documents", upload.single("file"), async (req, res): Promise<void> => {
  const params = GetOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No document file uploaded" });
    return;
  }

  const [doc] = await db.insert(onboardingDocumentsTable).values({
    onboardingId: params.data.id,
    fileName: req.file.originalname,
    fileUrl: req.file.path,
    fileType: req.file.mimetype,
  }).returning();

  // Auto-toggle documentsUploaded flag
  await db.update(onboardingTable)
    .set({ documentsUploaded: true, updatedAt: new Date() })
    .where(eq(onboardingTable.id, params.data.id));

  res.status(201).json({
    ...doc,
    uploadedAt: new Date(doc.uploadedAt).toISOString()
  });
});

router.post("/onboarding/:id/generate-offer", async (req, res): Promise<void> => {
  const params = GetOnboardingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [onboarding] = await db.select().from(onboardingTable).where(eq(onboardingTable.id, params.data.id));
  if (!onboarding) {
    res.status(404).json({ error: "Onboarding record not found" });
    return;
  }
  
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, onboarding.candidateId));
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, onboarding.jobId));
  
  if (!candidate || !job) {
    res.status(400).json({ error: "Missing candidate or job details" });
    return;
  }

  // Generate PDF
  const doc = new PDFDocument({ margin: 50 });
  
  // Create a buffer stream
  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    const pdfData = Buffer.concat(buffers);
    res.writeHead(200, {
      "Content-Length": Buffer.byteLength(pdfData),
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="offer_letter_${candidate.name.replace(/\s+/g, '_')}.pdf"`,
    });
    res.end(pdfData);
  });

  // Write content
  doc.fontSize(20).text("OFFER OF EMPLOYMENT", { align: "center" });
  doc.moveDown(2);
  doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();
  doc.text(`Dear ${candidate.name},`);
  doc.moveDown();
  doc.text(`We are thrilled to offer you the position of ${job.title} at Matchpoint.`);
  doc.moveDown();
  doc.text(`Your starting salary will be $${onboarding.salary?.toLocaleString() || "TBD"} per year.`);
  doc.moveDown();
  doc.text(`Your expected joining date is ${onboarding.joiningDate ? new Date(onboarding.joiningDate).toLocaleDateString() : "TBD"}.`);
  doc.moveDown(2);
  doc.text("We look forward to welcoming you to the team!");
  doc.moveDown(3);
  doc.text("Sincerely,");
  doc.text("The Matchpoint Hiring Team");
  
  doc.end();
});

export default router;
