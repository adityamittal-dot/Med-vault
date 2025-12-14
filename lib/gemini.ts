import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing Gemini API key in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export interface LabReportContext {
  rawText: string;
  structuredData?: {
    patientName?: string;
    data?: string;
    testType?: string;
    testResults?: Array<{
      name: string;
      value: string;
      unit?: string;
      referenceRange?: string;
      status?: "normal" | "high" | "low" | "critical";
    }>;
  };
}

export async function analyzeLabReportText(
  input: string | LabReportContext
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let rawText: string;
  let structuredData: LabReportContext["structuredData"] | undefined;

  if (typeof input === "string") {
    rawText = input;
  } else {
    rawText = input.rawText;
    structuredData = input.structuredData;
  }

  let prompt = `You are a medical AI assistant. Analyze the following lab report text and extract key information such as patient name, date, test type, and test results. Present the extracted information in a structured JSON format.

RAW LAB REPORT TEXT:
${rawText}
`;

  if (structuredData) {
    prompt += `

TASKS:
1. summarize the overall lab report in a simple, reassuring language.
2. call out any abnormal values (high/low/critical) and what they might mean in broad terms.
3. for each abnormal value, explain what it typically indicates (in general terms, not specific diagnosis).
4. suggest 3-5 concrete follow-up questions the patient could ask their clinician.
5. use short paragraphs and bullet points for clarity.
6. do not give any treatment plans, prescriptions, or specific medical advice.
7. always remind the patient to consult with their healthcare provider for personalized interpretation and advice.

IMPORTANT FORMATTING:
- do not use markdown formatting (no asterisks, hashtags or backticks).
- use plain text only.
- use line breaks and bullet points for readability.
- keep formatting clean and readable.
- start with a friendly greeting.
- end with a reminder to consult their healthcare provider.
- always address the patient in a friendly and reassuring tone.

EXTRACTED STRUCTURED DATA:
- Test Type: ${structuredData.testType || "N/A"}
- Patient Name: ${structuredData.patientName || "N/A"}
- Date: ${structuredData.data || "N/A"}
- Test Results:
${
  structuredData.testResults
    ?.map(
      (result) =>
        `  - ${result.name}: ${result.value} ${result.unit || ""} (Reference Range: ${
          result.referenceRange || "N/A"
        }, Status: ${result.status || "N/A"})`
    )
    .join("\n") || "  N/A"
}
`;
  }

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export async function analyzeLabReportPdfFormatBuffer(
  pdfBuffer: Buffer,
  filename: string
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const base64Pdf = pdfBuffer.toString("base64");

  const prompt = `You are a medical AI assistant. Analyze the following lab report provided as a PDF file (base64 encoded).

FILE NAME: ${filename || "lab report pdf"}

TASKS:
1. carefully read the entire lab report PDF, including any tables and reference ranges.
2. summarize the overall picture in simple, reassuring language.
3. call out any abnormal values (high/low/critical) and what they might mean in broad terms.
4. group results into categories (e.g., blood tests, metabolic panel, lipid profile) when possible for clarity.
5. use short paragraphs and bullet points for clarity.
6. do not give any treatment plans, prescriptions, or specific medical advice.
7. always remind the patient to consult with their healthcare provider for personalized interpretation and advice.

IMPORTANT FORMATTING:
- do not use markdown formatting (no asterisks, hashtags or backticks).
- use plain text only.
- use line breaks and bullet points for readability.
- keep formatting clean and readable.
- start with a friendly greeting.
- end with a reminder to consult their healthcare provider.
- always address the patient in a friendly and reassuring tone.
`;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
        ],
      },
    ],
  });

  return result.response.text();
}

export async function chatWithLabReport(
  rawText: string,
  analysisText: string | null,
  question: string
): Promise<string> {
  if (!genAI) {
    throw new Error("Gemini API client not initialized");
  }

  if (!rawText || rawText.trim().length === 0) {
    throw new Error("Lab report text is required for chatting");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  let prompt = `You are a helpful medical AI assistant. You have access to the COMPLETE RAW TEXT from the user's lab report PDF. Use the provided lab report text and analysis to answer the patient's question accurately and clearly.

=== RAW LAB REPORT TEXT (COMPLETE) ===
${rawText.substring(0, 50000)}${
    rawText.length > 50000 ? "\n\n[... text truncated for length ...]" : ""
  }
=== END OF LAB REPORT TEXT ===
`;

  if (analysisText && analysisText.trim().length > 0) {
    prompt += `

=== PREVIOUS AI ANALYSIS SUMMARY ===
${analysisText}
=== END OF ANALYSIS ===
`;
  }

  prompt += `

The patient is now asking a follow-up question about their lab results.

PATIENT'S QUESTION:
${question}

CRITICAL INSTRUCTIONS:
1. you have the complete raw text of the lab report available above. refer to it directly to ensure accuracy.
2. if an analysis summary is provided, you can reference it, but always verify details against the raw text.
3. DO NOT say you don't have access to the lab report data - you have the complete raw text available.
4. reference specific values, test names, reference ranges and findings from the raw text when answering.
5. use a friendly and reassuring tone.
6. do not give any treatment plans, prescriptions, or specific medical advice.
7. always remind the patient to consult with their healthcare provider for personalized interpretation and advice.

IMPORTANT FORMATTING:
- do not use markdown formatting (no asterisks, hashtags or backticks).
- use plain text only.
- use line breaks and bullet points for readability.
- keep formatting clean and readable.
- start with a friendly greeting.
- end with a reminder to consult their healthcare provider.
- always address the patient in a friendly and reassuring tone.
`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
