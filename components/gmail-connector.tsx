"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function GmailConnector() {
  const [isConnected, setIsConnected] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConnect = () => {
    // In a starter template, we just simulate connection
    setIsConnected(true);
    alert("This is a demo. In a production environment, this would redirect to Gmail OAuth authorization.");
  };

  const handleFetchReports = () => {
    alert("This is a demo. In a production environment, this would fetch lab reports from Gmail via your integration service.");
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Connect Gmail
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Lab Reports from Gmail</DialogTitle>
          <DialogDescription>
            Connect your Gmail account to automatically import lab report emails
            and attachments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Connect Gmail Account
                </CardTitle>
                <CardDescription>
                  Securely connect your Gmail to automatically fetch lab reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleConnect}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Connect Gmail
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Your Gmail credentials are encrypted and stored securely. We
                  only access emails related to lab reports and test results.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">Gmail Connected</span>
                </div>
                <Button
                  onClick={handleFetchReports}
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Fetch Lab Reports
                </Button>
              </div>

              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    No lab report emails found. Click "Fetch Lab Reports" to
                    search your inbox.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
