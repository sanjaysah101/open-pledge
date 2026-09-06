import { Skeleton } from "@/components/ui/skeleton";

export default function LedgerLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-10 w-full max-w-2xl" />
      </div>
      <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-card p-4">
        {["r1", "r2", "r3", "r4", "r5", "r6"].map((k) => (
          <Skeleton key={k} className="h-10 w-full" />
        ))}
      </div>
    </main>
  );
}
