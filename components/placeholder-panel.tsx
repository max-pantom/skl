export function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="skl-surface mx-auto max-w-3xl p-8 sm:p-10">
      <div className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Shell route</p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-600">{description}</p>
      </div>
    </section>
  );
}
