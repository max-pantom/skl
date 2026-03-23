export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-8">
      <div className="mx-auto flex w-full max-w-[1056px] flex-col gap-3 text-[16px] font-medium text-[#8f8f8f] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[16px] font-medium uppercase tracking-[0.16em] text-[#8f8f8f]">SKL</p>
        <div className="flex flex-col items-start gap-1 text-left sm:items-end sm:text-right">
          <p className="text-[12px] font-medium uppercase tracking-[0.16em] text-[#8f8f8f]">Beta</p>
          <p className="text-[12px] font-medium text-[#8f8f8f]">Copyright 2026 SKL</p>
        </div>
      </div>
    </footer>
  );
}
