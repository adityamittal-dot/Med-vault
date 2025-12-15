import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  analyzeLabReportPdfFormatBuffer,
  analyzeLabReportText,
} from "@/lib/gemini";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    // ✅ Env check (UNCHANGED LOGIC)
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not set" },
        { status: 500 }
      );
    }

    // ✅ Auth header
    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    // ✅ Attach session
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: "",
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const fileName = formData.get("fileName") as string | null;
    const userId = formData.get("userId") as string | null;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    if (!file || !fileName) {
      return NextResponse.json(
        { error: "File and fileName are required" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // ✅ Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ❌ pdf-parse REMOVED (incompatible with Next.js + Turbopack)
    const extractedText = "";

    // ✅ AI analysis (PDF first)
    let aiAnalysis: string | null = null;
    let analysisStatus: "completed" | "failed" = "failed";

    try {
      aiAnalysis = await analyzeLabReportPdfFormatBuffer(
        buffer,
        fileName || file.name
      );
      if (aiAnalysis) {
        analysisStatus = "completed";
      }
    } catch (error) {
      console.error("AI analysis error:", error);
    }

    // 🔁 FALLBACK: text-based AI (will activate once OCR is added)
    if (!aiAnalysis && extractedText) {
      try {
        aiAnalysis = await analyzeLabReportText(
          extractedText ||
            "This is a medical lab report. Provide a general explanation of lab results."
        );
        if (aiAnalysis) {
          analysisStatus = "completed";
        }
      } catch (error) {
        console.error("Fallback AI analysis error:", error);
      }
    }

    // ✅ INSERT INTO SUPABASE
    const { data: labReport, error: dbError } = await supabase
      .from("lab_reports")
      .insert({
        user_id: userId,
        file_name: fileName || file.name,
        raw_text: extractedText || "No extractable text found",
        structured_data: null,
        ai_analysis: aiAnalysis,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError || !labReport) {
      console.error("Database insertion error:", dbError);
      return NextResponse.json(
        { error: "Failed to save lab report metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysisStatus,
      labReport: {
        id: labReport.id,
        file_name: labReport.file_name,
        ai_analysis: labReport.ai_analysis,
        uploaded_at: labReport.uploaded_at,
        rawTextLength: extractedText.length,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during upload" },
      { status: 500 }
    );
  }
}
