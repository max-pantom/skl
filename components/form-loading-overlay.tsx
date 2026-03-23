"use client";

import { useFormStatus } from "react-dom";

import { SklLoading } from "@/components/skl-loading";

export function FormLoadingOverlay() {
  const { pending } = useFormStatus();

  if (!pending) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[32px] bg-white/88 backdrop-blur-sm">
      <SklLoading />
    </div>
  );
}
