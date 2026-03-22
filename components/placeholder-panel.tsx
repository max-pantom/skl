export function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="border-t border-zinc-200 py-10 text-center">
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="page-kicker">Shell route</p>
        <h1 className="page-title">{title}</h1>
        <p className="mx-auto max-w-2xl text-[16px] font-medium leading-[1.2] text-[#242424] opacity-80">{description}</p>
      </div>
    </section>
  );
}
