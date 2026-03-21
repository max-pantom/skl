export function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-panel p-8 shadow-card sm:p-10">
      <div className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Shell route</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      </div>
    </section>
  );
}
