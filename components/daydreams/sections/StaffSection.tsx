import type { StaffMember } from "@/lib/daydreams/types";

export function StaffSection({ staff }: { staff: StaffMember[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {staff.map((member) => (
        <div key={member.id} className="flex gap-4 rounded-xl border border-brand-ink/10 bg-white p-5 zone-dark:border-white/10 zone-dark:bg-white/5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: member.accentColor }}
            aria-hidden="true"
          >
            {member.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
          <div>
            <h3 className="font-bold text-brand-ink zone-dark:text-white">{member.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/60 zone-dark:text-white/50">
              {member.role}
            </p>
            <p className="mt-2 text-sm text-brand-ink/80 zone-dark:text-white/70">{member.bio}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
