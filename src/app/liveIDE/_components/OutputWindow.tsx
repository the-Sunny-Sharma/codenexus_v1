import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

interface OutputDetails {
  status?: {
    id: number;
    description: string;
  };
  compile_output?: string;
  stdout?: string;
  stderr?: string;
  time?: string;
  memory?: string;
}

interface OutputWindowProps {
  outputDetails?: OutputDetails;
}

const OutputWindow: React.FC<OutputWindowProps> = ({ outputDetails }) => {
  const getOutput = () => {
    const statusId = outputDetails?.status?.id;

    if (!outputDetails) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <AlertCircle className="w-12 h-12 mb-2" />
          <p>No output details available</p>
          <p className="text-sm">Run your code to see the output</p>
        </div>
      );
    }

    switch (statusId) {
      case 3: // Accepted
        return (
          <div className="space-y-4">
            <div className="flex items-center text-green-500">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Execution Successful</span>
            </div>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre className="text-sm">
                {outputDetails.stdout
                  ? atob(outputDetails.stdout)
                  : "No output"}
              </pre>
            </ScrollArea>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Time: {outputDetails.time || "N/A"}</span>
              <span>Memory: {outputDetails.memory || "N/A"}</span>
            </div>
          </div>
        );
      case 6: // Compilation Error
        return (
          <div className="space-y-4">
            <div className="flex items-center text-red-500">
              <XCircle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Compilation Error</span>
            </div>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre className="text-sm text-red-500">
                {outputDetails.compile_output
                  ? atob(outputDetails.compile_output)
                  : "No compile output available"}
              </pre>
            </ScrollArea>
          </div>
        );
      case 5: // Time Limit Exceeded
        return (
          <div className="flex items-center justify-center h-full text-yellow-500">
            <Clock className="w-8 h-8 mr-2" />
            <span className="font-semibold">Time Limit Exceeded</span>
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center text-red-500">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-semibold">Execution Error</span>
            </div>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <pre className="text-sm text-red-500">
                {outputDetails.stderr
                  ? atob(outputDetails.stderr)
                  : "No error output available"}
              </pre>
            </ScrollArea>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Output</CardTitle>
      </CardHeader>
      <CardContent>{getOutput()}</CardContent>
    </Card>
  );
};

export default OutputWindow;
