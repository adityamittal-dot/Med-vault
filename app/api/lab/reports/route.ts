import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration is missing" },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.replace(/^bearer\s+/i, "");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      ...(accessToken
        ? {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          }
        : {}),
    });

    if (accessToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "",
      });
    }

    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (!accessToken) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (userId !== user.id) {
        return NextResponse.json(
          { error: "user ID mismatch" },
          { status: 403 }
        );
      }
    }

    const { data: labReports, error: dbError } = await supabase
      .from("lab_reports")
      .select("*")
      .eq("user_id", userId)
      .order("uploaded_at", { ascending: false });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "Failed to fetch lab reports",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      labReports: labReports || [],
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
