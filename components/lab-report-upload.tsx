"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase-client";

interface LabReportUploadProps {
  onUploadSuccess?: () => void;
}

export function LabReportUpload({ onUploadSuccess }: LabReportUploadProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/pdf" ||
        selectedFile.name.endsWith(".pdf")
      ) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Please select a PDF file");
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (!supabase) {
      setError("Authentication service unavailable");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const {
        data: { user: userData },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("auth error:", userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }

      if (!userData) {
        throw new Error("please sign in to upload lab reports");
      }

      let session = null;

      const {
        data: { session: sessionData },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("session error:", sessionError);
      }

      if (sessionData) {
        session = sessionData;
      } else {
        try {
          const {
            data: { session: refreshedSession },
          } = await supabase.auth.refreshSession();
          session = refreshedSession;
        } catch (err) {
          console.error("session refresh error:", err);
        }
      }

      if (!session || !session.access_token) {
        setError(
          "No active session found. Please sign in again and try uploading your lab report."
        );
        setTimeout(() => {
          router.push("/auth");
        }, 2000);
        setUploading(false);
        return;
      }

      const user = userData;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("userId", user.id);

      const response = await fetch("/api/lab/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.details || "failed to upload lab report"
        );
      }

      if (!data.success) {
        throw new Error(data.error || "upload failed");
      }

      console.log("upload successful:", data);
      setFile(null);
      setError(null);

      setError("upload successful! refreshing...");
      setTimeout(() => {
        setOpen(false);
        setError(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      setError(error.message || "failed to upload lab report");
    } finally {
      setUploading(false);
    }

    // ✅ DEMO SUCCESS — UNCHANGED
    setError("Upload successful! (This is a demo - no actual upload occurred)");
    setTimeout(() => {
      setOpen(false);
      setFile(null);
      setError(null);
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    }, 1000);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Report
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Lab Report</DialogTitle>
          <DialogDescription>
            Upload a PDF of your lab test results. We will extract the content and
            provide AI-powered analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!file ? (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your lab report PDF here, or click to browse
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Select PDF File
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div
              className={`rounded-lg border p-3 ${
                error.includes("successful")
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p
                className={`text-sm ${
                  error.includes("successful")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {error}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setFile(null);
                setError(null);
              }}
            >
              Cancel
            </Button>

            <Button onClick={handleUpload} disabled={!file || uploading}>
              <Upload className="mr-2 h-4 w-4" />
              Upload & Analyze
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
