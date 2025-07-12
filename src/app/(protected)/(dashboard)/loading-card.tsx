import { Loader2 } from "lucide-react";

export default function LoadingCard({ title }: { title: string }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5 pb-4 mb-4 border-b">
        <h3 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h3>
      </div>
      <div className="flex items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
