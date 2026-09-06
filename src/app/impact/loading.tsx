import { Skeleton } from "@/components/ui/skeleton";

export default function ImpactLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <div className="mb-8 flex flex-col gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-14 w-full max-w-2xl" />
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {["a", "b", "c", "d"].map((k) => (
          <Skeleton key={k} className="h-24 w-full rounded-xl" />
        ))}
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </main>
  );
}
