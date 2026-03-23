import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Your claim card",
};

export default async function ClaimCardPage() {
  redirect("/claim");
}
