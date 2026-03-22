import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <section className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex max-w-[520px] flex-col items-center gap-4">
          <p className="page-kicker">404</p>
          <h1 className="page-title">Page not found</h1>
          <p className="page-description">The route exists in the registry map, but this record does not.</p>
          <Link href="/" className="skl-btn skl-btn-primary mt-2">
            Back home
          </Link>
        </div>
      </section>
    </div>
  );
}
