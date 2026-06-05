import { Groq } from "groq-sdk";
import fs from "fs";
// Initialize Groq client
// Note: Ensure GROQ_API_KEY is set in your .env
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export interface ParsedCandidate {
  name: string;
  email: string;
  phone: string | null;
  skills: string[];
  experience: number;
  education: string | null;
  university: string | null;
  summary: string | null;
}

export async function parseResumeWithAI(resumeText: string): Promise<ParsedCandidate> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set. Cannot parse resume with AI.");
  }

  const prompt = `
You are an expert technical recruiter and resume parser.
I will provide you with the raw extracted text from a candidate's resume.
Your task is to extract the following information and return it strictly as a JSON object:

- "name": Full name of the candidate (string, required)
- "email": Email address (string, required)
- "phone": Phone number (string or null)
- "skills": Array of technical skills (array of strings, keep it concise)
- "experience": Total years of professional experience (integer, default to 0 if unknown)
- "education": Highest degree obtained (string or null)
- "university": Name of the university (string or null)
- "summary": A brief 1-2 sentence professional summary of the candidate (string or null)

Do NOT include any markdown formatting like \`\`\`json. Return ONLY the raw JSON object.

Resume Text:
---
${resumeText}
---
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant", // Using a fast/cheap model for extraction, can upgrade to llama-3.1-70b-versatile
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    return {
      name: parsed.name || "Unknown Candidate",
      email: parsed.email || "no-email@example.com",
      phone: parsed.phone || null,
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: parseInt(parsed.experience, 10) || 0,
      education: parsed.education || null,
      university: parsed.university || null,
      summary: parsed.summary || null,
    };
  } catch (error) {
    console.error("Groq AI parsing error:", error);
    throw new Error("Failed to parse resume with AI");
  }
}

export async function analyzeResumeWithAI(resumeText: string): Promise<{
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendedRoles: string[];
  hiringRecommendation: string;
  score: number;
}> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const prompt = `
You are an expert technical recruiter. Analyze the following candidate resume text.
Return a structured JSON object containing:
- "strengths": Array of 3-5 key strengths (strings)
- "weaknesses": Array of 1-3 areas for improvement (strings)
- "missingSkills": Array of 1-3 highly demanded tech skills they are missing (strings)
- "recommendedRoles": Array of 1-3 job titles they are a good fit for (strings)
- "hiringRecommendation": Exactly one of: "Strong Hire", "Hire", "Maybe", "Reject"
- "score": An integer from 0 to 100 representing overall quality

Do NOT include any markdown formatting. Return ONLY the JSON object.

Resume Text:
---
${resumeText}
---
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    return {
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      recommendedRoles: Array.isArray(parsed.recommendedRoles) ? parsed.recommendedRoles : [],
      hiringRecommendation: ["Strong Hire", "Hire", "Maybe", "Reject"].includes(parsed.hiringRecommendation) ? parsed.hiringRecommendation : "Maybe",
      score: typeof parsed.score === 'number' ? parsed.score : 70,
    };
  } catch (error) {
    console.error("Groq AI analysis error:", error);
    throw new Error("Failed to analyze resume with AI");
  }
}

export async function transcribeAudio(filePath: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-large-v3",
      response_format: "json",
    });

    return transcription.text;
  } catch (error) {
    console.error("Groq transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

export async function analyzeInterviewTranscript(transcript: string): Promise<{
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  overallScore: number;
  aiNotes: string;
}> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set.");
  }

  const prompt = `
You are an expert technical interviewer evaluating a candidate's spoken response.
Below is the raw transcript of their video interview answer.

Analyze the transcript and provide a JSON response containing:
- "technicalScore": Score from 0-100 evaluating the accuracy and depth of technical concepts discussed. (If it's a general question, evaluate relevance and logic).
- "communicationScore": Score from 0-100 evaluating clarity, conciseness, and structure.
- "confidenceScore": Score from 0-100 evaluating apparent confidence (absence of excessive filler words like 'um', 'uh', hesitations).
- "overallScore": The average of the three scores above.
- "aiNotes": A 2-3 sentence qualitative feedback summarizing strengths and weaknesses of the answer.

Do NOT include any markdown formatting. Return ONLY the JSON object.

Transcript:
---
${transcript}
---
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    return {
      technicalScore: typeof parsed.technicalScore === 'number' ? parsed.technicalScore : 70,
      communicationScore: typeof parsed.communicationScore === 'number' ? parsed.communicationScore : 70,
      confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 70,
      overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : 70,
      aiNotes: parsed.aiNotes || "The candidate provided a standard response.",
    };
  } catch (error) {
    console.error("Groq interview analysis error:", error);
    throw new Error("Failed to analyze interview transcript");
  }
}
