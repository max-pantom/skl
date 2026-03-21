import Link from "next/link";

export default function NotFound() {
  return (
    <section className="skl-surface mx-auto max-w-2xl p-10 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Page not found</h1>
      <p className="mt-4 text-sm leading-7 text-zinc-600">
        The route exists in the registry map, but this record does not.
      </p>
      <Link href="/" className="skl-btn skl-btn-primary mt-8 inline-flex">
        Back home
      </Link>
    </section>
  );
}
