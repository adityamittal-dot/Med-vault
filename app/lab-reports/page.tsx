"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GmailConnector } from "@/components/gmail-connector";
import { LabReportUpload } from "@/components/lab-report-upload";
import { LabGeminiPanel } from "@/components/lab-gemini-panel";
import { LabReportChat } from "@/components/lab-report-chat";

interface LabReport {
  id: string;
  file_name: string;
  raw_text: string;
  structured_data?: {
    testType?: string;
    date?: string;
    testResults?: Array<{
      name: string;
      value: string;
      unit?: string;
      referenceRange?: string;
      status?: "normal" | "high" | "low" | "critical";
    }>;
  };
  ai_analysis?: string;
  uploaded_at: string;
}

// Dummy data for starter template
const dummyLabReports: LabReport[] = [
  {
    id: "1",
    file_name: "Complete Blood Count - Jan 2024.pdf",
    raw_text: "Complete Blood Count results from January 2024",
    structured_data: {
      testType: "Complete Blood Count",
      date: "2024-01-15",
      testResults: [
        {
          name: "Hemoglobin",
          value: "14.2",
          unit: "g/dL",
          referenceRange: "13.0 - 17.0",
          status: "normal",
        },
        {
          name: "White Blood Cell Count",
          value: "7.5",
          unit: "x10^9/L",
          referenceRange: "4.0 - 11.0",
          status: "normal",
        },
        {
          name: "Platelet Count",
          value: "250",
          unit: "x10^9/L",
          referenceRange: "150 - 450",
          status: "normal",
        },
      ],
    },
    ai_analysis: "Your complete blood count results are within normal ranges. All values appear healthy and show no signs of concern. Continue with your regular health routine.",
    uploaded_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    file_name: "Lipid Panel - Dec 2023.pdf",
    raw_text: "Lipid Panel results from December 2023",
    structured_data: {
      testType: "Lipid Panel",
      date: "2023-12-10",
      testResults: [
        {
          name: "Total Cholesterol",
          value: "195",
          unit: "mg/dL",
          referenceRange: "< 200",
          status: "normal",
        },
        {
          name: "LDL Cholesterol",
          value: "125",
          unit: "mg/dL",
          referenceRange: "< 100",
          status: "high",
        },
        {
          name: "HDL Cholesterol",
          value: "55",
          unit: "mg/dL",
          referenceRange: "> 40",
          status: "normal",
        },
        {
          name: "Triglycerides",
          value: "150",
          unit: "mg/dL",
          referenceRange: "< 150",
          status: "normal",
        },
      ],
    },
    ai_analysis: "Your lipid panel shows mostly normal results. Your LDL cholesterol is slightly elevated. Consider discussing dietary changes with your healthcare provider.",
    uploaded_at: "2023-12-10T14:20:00Z",
  },
  {
    id: "3",
    file_name: "Metabolic Panel - Nov 2023.pdf",
    raw_text: "Metabolic Panel results from November 2023",
    structured_data: {
      testType: "Comprehensive Metabolic Panel",
      date: "2023-11-05",
      testResults: [
        {
          name: "Glucose",
          value: "95",
          unit: "mg/dL",
          referenceRange: "70 - 100",
          status: "normal",
        },
        {
          name: "Creatinine",
          value: "1.0",
          unit: "mg/dL",
          referenceRange: "0.7 - 1.3",
          status: "normal",
        },
        {
          name: "Sodium",
          value: "140",
          unit: "mEq/L",
          referenceRange: "136 - 145",
          status: "normal",
        },
      ],
    },
    ai_analysis: "All metabolic panel values are within normal ranges. Your kidney function, electrolyte balance, and glucose levels appear healthy.",
    uploaded_at: "2023-11-05T09:15:00Z",
  },
];

export default function LabReportsPage() {
  const [labReports, setLabReports] = useState<LabReport[]>(dummyLabReports);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  const handleDelete = (reportId: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      setLabReports(labReports.filter((r) => r.id !== reportId));
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    }
  };

  // Calculate statistics
  const totalReports = labReports.length;
  const normalReports = labReports.filter((r) => {
    const results = r.structured_data?.testResults || [];
    return results.every((t) => t.status === "normal" || !t.status);
  }).length;
  const abnormalReports = totalReports - normalReports;
  const criticalReports = labReports.filter((r) => {
    const results = r.structured_data?.testResults || [];
    return results.some((t) => t.status === "critical");
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Lab Report Analysis
          </h2>
          <p className="text-muted-foreground">
            Upload and analyze your lab test results with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GmailConnector />
          <LabReportUpload onUploadSuccess={() => {}} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Recent Reports</TabsTrigger>
          <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reports
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReports}</div>
                <p className="text-xs text-muted-foreground">
                  {labReports.length > 0
                    ? `Last uploaded ${new Date(
                        labReports[0]?.uploaded_at
                      ).toLocaleDateString()}`
                    : "No reports yet"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Normal Results
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{normalReports}</div>
                <p className="text-xs text-muted-foreground">
                  {totalReports > 0
                    ? `${Math.round(
                        (normalReports / totalReports) * 100
                      )}% of all reports`
                    : "No data"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Abnormal Results
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{abnormalReports}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Critical Alerts
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{criticalReports}</div>
                <p className="text-xs text-muted-foreground">Action needed</p>
              </CardContent>
            </Card>
          </div>

          {labReports.length > 0 && labReports[0]?.ai_analysis ? (
            <Card>
              <CardHeader>
                <CardTitle>Latest Report Analysis</CardTitle>
                <CardDescription>
                  AI-powered analysis of your most recent lab results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border p-4 bg-muted/50 whitespace-pre-wrap text-sm">
                  {labReports[0].ai_analysis
                    ?.replace(/\*\*/g, "")
                    .replace(/\*/g, "")
                    .replace(/#{1,6}\s+/g, "")
                    .replace(/`/g, "")}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Reports Yet</CardTitle>
                <CardDescription>
                  Upload your first lab report to get AI-powered analysis
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <LabGeminiPanel />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lab Reports</CardTitle>
              <CardDescription>
                View and manage your uploaded lab reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {labReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No lab reports uploaded yet</p>
                  <p className="text-sm">
                    Upload your first report to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {labReports.map((report) => {
                    const hasAbnormal =
                      report.structured_data?.testResults?.some(
                        (t) =>
                          t.status === "high" ||
                          t.status === "low" ||
                          t.status === "critical"
                      );
                    const hasCritical =
                      report.structured_data?.testResults?.some(
                        (t) => t.status === "critical"
                      );

                    return (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {report.structured_data?.testType ||
                                report.file_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {report.structured_data?.date ||
                                new Date(
                                  report.uploaded_at
                                ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={hasAbnormal ? "secondary" : "default"}
                          >
                            {hasAbnormal ? "Abnormal" : "Normal"}
                          </Badge>
                          {hasCritical && (
                            <Badge variant="outline">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Critical
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(report.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {selectedReport ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Detailed Test Results</CardTitle>
                      <CardDescription>
                        {selectedReport.structured_data?.testType ||
                          selectedReport.file_name}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedReport.structured_data?.testResults &&
                  selectedReport.structured_data.testResults.length > 0 ? (
                    <div className="space-y-4">
                      {selectedReport.structured_data.testResults.map(
                        (test, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{test.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Range: {test.referenceRange || "N/A"}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <p className="font-semibold">
                                {test.value} {test.unit || ""}
                              </p>
                              <Badge
                                variant={
                                  test.status === "normal" || !test.status
                                    ? "default"
                                    : test.status === "critical"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {test.status === "normal"
                                  ? "Normal"
                                  : test.status === "high"
                                  ? "High"
                                  : test.status === "low"
                                  ? "Low"
                                  : test.status === "critical"
                                  ? "Critical"
                                  : "Unknown"}
                              </Badge>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No structured test results found. Raw text available
                      below.
                    </p>
                  )}

                  {selectedReport.ai_analysis && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold mb-2">AI Analysis</h4>
                      <div className="rounded-lg border p-4 bg-muted/50 whitespace-pre-wrap text-sm">
                        {selectedReport.ai_analysis
                          ?.replace(/\*\*/g, "")
                          .replace(/\*/g, "")
                          .replace(/#{1,6}\s+/g, "")
                          .replace(/`/g, "")}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chat Interface */}
              <LabReportChat
                reportId={selectedReport.id}
                fileName={selectedReport.file_name}
              />
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Test Results</CardTitle>
                <CardDescription>
                  Select a report from the Recent Reports tab to view detailed
                  analysis
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
