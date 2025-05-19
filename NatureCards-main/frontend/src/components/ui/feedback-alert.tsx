import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type FeedbackAlertProps = {
  type?: "success" | "error";
  title: string;
  message: string;
  className?: string;
};

export function FeedbackAlert({
  type = "success",
  title,
  message,
  className,
}: FeedbackAlertProps) {
  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <Alert
      variant={isError ? "destructive" : "default"}
      className={cn("flex items-start gap-3", className)}
    >
      <Icon className="h-5 w-5 mt-1" />
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
    </Alert>
  );
}
