import { Loader2 } from "lucide-react";

export default function LoadingIndicator() {
  return (
    <div className="w-full flex justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
