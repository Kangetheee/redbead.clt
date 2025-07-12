export default function ErrorCard({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-destructive bg-destructive/10 text-card-foreground shadow-sm p-6">
      <div className="flex flex-col space-y-1.5 pb-4 mb-4 border-b border-destructive/20">
        <h3 className="text-lg font-semibold leading-none tracking-tight text-destructive">
          {title}
        </h3>
      </div>
      <div className="flex items-center justify-center h-40 text-destructive">
        <p>Failed to load data</p>
      </div>
    </div>
  );
}
