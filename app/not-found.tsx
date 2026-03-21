import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl rounded-[2rem] border border-line bg-panel p-10 text-center shadow-card">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Page not found</h1>
      <p className="mt-4 text-sm leading-7 text-slate-600">
        The route exists in the registry map, but this record does not.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full border border-ink bg-ink px-4 py-2 text-sm font-medium text-shell transition hover:bg-slate-900"
      >
        Back home
      </Link>
    </section>
  );
}
