import { CsvTable } from "./csvStore.js";

// Define the types manually since we removed Drizzle ORM
export type Job = {
  id: number;
  title: string;
  description: string;
  requiredSkills: string[];
  experience: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  employmentType: string;
  status: "open" | "closed" | "paused";
  createdAt: Date;
  updatedAt: Date;
};

export type Candidate = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  skills: string[];
  experience: number;
  education: string | null;
  university: string | null;
  resumeScore: number;
  interviewScore: number;
  finalScore: number;
  recommendation: string | null;
  status: "active" | "rejected" | "hired" | "withdrawn";
  summary: string | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Application = {
  id: number;
  candidateId: number;
  jobId: number;
  status: "applied" | "shortlisted" | "interviewed" | "offered" | "hired" | "rejected";
  matchScore: number | null;
  resumeScore: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Interview = {
  id: number;
  candidateId: number;
  jobId: number;
  status: "scheduled" | "completed" | "cancelled";
  scheduledAt: Date | null;
  transcript: string | null;
  technicalScore: number | null;
  communicationScore: number | null;
  relevanceScore: number | null;
  confidenceScore: number | null;
  problemSolvingScore: number | null;
  overallScore: number | null;
  aiNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Onboarding = {
  id: number;
  candidateId: number;
  jobId: number;
  status: "pending" | "in-progress" | "completed";
  offerAccepted: boolean;
  documentsUploaded: boolean;
  verificationComplete: boolean;
  trainingAssigned: boolean;
  joiningDate: Date | null;
  salary: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Create tables
export const jobsTable = new CsvTable<Job>("jobs.csv", [
  "id", "title", "description", "requiredSkills", "experience", "salaryMin",
  "salaryMax", "location", "employmentType", "status", "createdAt", "updatedAt"
]);

export const candidatesTable = new CsvTable<Candidate>("candidates.csv", [
  "id", "name", "email", "phone", "location", "skills", "experience", "education",
  "university", "resumeScore", "interviewScore", "finalScore", "recommendation",
  "status", "summary", "source", "createdAt", "updatedAt"
]);

export const applicationsTable = new CsvTable<Application>("applications.csv", [
  "id", "candidateId", "jobId", "status", "matchScore", "resumeScore", "createdAt", "updatedAt"
]);

export const interviewsTable = new CsvTable<Interview>("interviews.csv", [
  "id", "candidateId", "jobId", "status", "scheduledAt", "transcript", "technicalScore",
  "communicationScore", "relevanceScore", "confidenceScore", "problemSolvingScore",
  "overallScore", "aiNotes", "createdAt", "updatedAt"
]);

export const onboardingTable = new CsvTable<Onboarding>("onboarding.csv", [
  "id", "candidateId", "jobId", "status", "offerAccepted", "documentsUploaded",
  "verificationComplete", "trainingAssigned", "joiningDate", "salary", "notes",
  "createdAt", "updatedAt"
]);
