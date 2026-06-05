import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { parse } from "csv-parse/sync";

export async function extractTextFromBuffer(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "application/pdf") {
    const data = await PDFParse(buffer);
    return data.text;
  }

  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword" ||
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // docx
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  // Fallback to text reading
  return buffer.toString("utf-8");
}

export async function parseCsvCandidates(buffer: Buffer): Promise<any[]> {
  const fileContent = buffer.toString("utf-8");
  
  // Parse CSV
  // Expecting columns: name, email, phone, skills, experience, education, university
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map((record: any) => ({
    name: record.name || "Unknown",
    email: record.email || "no-email@example.com",
    phone: record.phone || null,
    skills: record.skills ? record.skills.split(",").map((s: string) => s.trim()) : [],
    experience: parseInt(record.experience, 10) || 0,
    education: record.education || null,
    university: record.university || null,
    summary: record.summary || null,
  }));
}
