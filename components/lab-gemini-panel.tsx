"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function LabGeminiPanel() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    
    // Simulate AI analysis with dummy response
    setAnalysis("This is a demo analysis. In a production environment, this would be processed by an AI service (like Gemini) to provide patient-friendly explanations of lab results. The interface is ready for integration with your AI service.\n\nYour lab values would be analyzed here with:\n- Overall health summary\n- Abnormal value explanations\n- Follow-up questions for your clinician");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <CardTitle>AI Lab Report Assistant</CardTitle>
        </div>
        <CardDescription>
          Paste your lab values and get a patient-friendly explanation powered
          by AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Paste your lab results here, e.g.:
Hemoglobin: 11.2 g/dL (13.0 - 17.0)
WBC: 12.5 x10^9/L (4.0 - 11.0)
...`}
          rows={6}
        />
        <div className="flex justify-end">
          <Button onClick={handleAnalyze} disabled={!input.trim()}>
            Analyze with AI
          </Button>
        </div>
        {analysis && (
          <div className="mt-4 border rounded-md p-3 text-sm whitespace-pre-wrap bg-muted/40">
            {analysis
              .replace(/\*\*/g, "")
              .replace(/\*/g, "")
              .replace(/#{1,6}\s+/g, "")
              .replace(/`/g, "")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
