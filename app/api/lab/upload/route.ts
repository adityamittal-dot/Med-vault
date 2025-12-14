import {NextRequest, NextResponse} from "next/server";
import { createClient } from "@supabase/supabase-js";
import { analyzeLabReportPdfFormatBuffer } from "@/lib/gemini";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    if(!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({error: "Supabase environment variables are not set"}, {status: 500});
    }

    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.replace("Bearer ", "");

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;
    const userId = formData.get("userId") as string; 

    if(!userId) {
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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let aiAnalysis: string | null = null;
    try {
      aiAnalysis = await analyzeLabReportPdfFormatBuffer(buffer,
        fileName || file.name);
    } catch (error: any) {
      console.error("AI analysis error:", error);
    }

    const {data: labReport, error: dbError} = await supabase
      .from("lab_report")
      .insert([
        {
          user_id: userId,
          file_name: fileName || file.name,
          raw_text: "PDF text extraction not available",
          structured_data: null,
          ai_analysis: aiAnalysis,
          uploaded_at: new Date().toISOString(),
        })
      .select()
      .single();


    if (dbError) {
      console.error("Database insertion error:", dbError);
      return NextResponse.json(
        { error: "Failed to save lab report metadata" },
        { status: 500 }
      );
    } 
      return NextResponse.json({
        success: true,
        labReport:{
          id: labReport.id,
          file_name: labReport.file_name,
          ai_analysis: labReport.ai_analysis,
          uploaded_at: labReport.uploaded_at,
          rawTextLength: 0,
        },
      }); 
    }catch (error) {
      console.error("upload error:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred during upload" },
        { status: 500 }
      );
    }
  }