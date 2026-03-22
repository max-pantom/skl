import type { UserRole } from "@/lib/types";

const roleStyles: Record<Extract<UserRole, "pro">, string> = {
  pro: "bg-[rgba(24,24,27,0.12)] text-[#242424]",
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  if (role !== "pro") {
    return null;
  }

  return (
    <span
      className={`inline-flex rounded-[90px] px-[6px] py-[2px] text-[11px] font-semibold uppercase leading-none tracking-[0.14em] ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}
