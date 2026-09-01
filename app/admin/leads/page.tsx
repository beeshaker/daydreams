import Link from "next/link";
import { listLeads, type LeadStatus } from "@/lib/leads/store";
import { updateLeadAction } from "./actions";

export const metadata = {
  title: "Admin — Leads",
};

const STATUSES: LeadStatus[] = ["new", "contacted", "booked", "closed"];

function isLeadStatus(value: string | string[] | undefined): value is LeadStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

export default async function AdminLeadsPage(props: PageProps<"/admin/leads">) {
  const searchParams = await props.searchParams;
  const statusParam = Array.isArray(searchParams.status) ? searchParams.status[0] : searchParams.status;
  const leadTypeParam = Array.isArray(searchParams.leadType)
    ? searchParams.leadType[0]
    : searchParams.leadType;
  const searchParam = Array.isArray(searchParams.search) ? searchParams.search[0] : searchParams.search;

  const leads = await listLeads({
    status: isLeadStatus(statusParam) ? statusParam : undefined,
    leadType:
      leadTypeParam === "daycare-interest" || leadTypeParam === "gym-interest" ? leadTypeParam : undefined,
    search: searchParam,
  });

  const exportQuery = new URLSearchParams();
  if (statusParam) exportQuery.set("status", statusParam);
  if (leadTypeParam) exportQuery.set("leadType", leadTypeParam);
  if (searchParam) exportQuery.set("search", searchParam);

  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Leads</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/admin/kb" className="text-brand-lavender-strong underline">
              Knowledge base
            </Link>
            <Link href="/admin/classes" className="text-brand-lavender-strong underline">
              Classes
            </Link>
            <a
              href={`/admin/leads/export?${exportQuery.toString()}`}
              className="rounded-md bg-brand-pink-strong px-3 py-1.5 font-semibold text-white hover:brightness-95"
            >
              Export CSV
            </a>
          </div>
        </div>

        <form method="get" className="mt-6 flex flex-wrap gap-3 text-sm">
          <select name="status" defaultValue={statusParam ?? ""} className="rounded-md border border-brand-ink/20 bg-white px-3 py-2">
            <option value="">All statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            name="leadType"
            defaultValue={leadTypeParam ?? ""}
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2"
          >
            <option value="">All lead types</option>
            <option value="daycare-interest">Daycare interest</option>
            <option value="gym-interest">Gym interest</option>
          </select>
          <input
            type="text"
            name="search"
            defaultValue={searchParam ?? ""}
            placeholder="Search name, email, notes…"
            className="min-w-[200px] rounded-md border border-brand-ink/20 bg-white px-3 py-2"
          />
          <button type="submit" className="rounded-md bg-white px-3 py-2 font-semibold ring-1 ring-brand-ink/15 hover:bg-brand-bg">
            Filter
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded-lg border border-brand-ink/10 bg-white">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-brand-ink/10 text-xs uppercase tracking-wide text-brand-ink/50">
              <tr>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Contact</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-brand-ink/5 align-top last:border-0">
                  <td className="whitespace-nowrap px-3 py-3 text-brand-ink/70">
                    {new Date(lead.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-3">{lead.leadType}</td>
                  <td className="px-3 py-3">{lead.source}</td>
                  <td className="px-3 py-3">{lead.parentName}</td>
                  <td className="px-3 py-3">
                    <div>{lead.email}</div>
                    {lead.phone && <div className="text-brand-ink/60">{lead.phone}</div>}
                  </td>
                  <td className="max-w-[220px] px-3 py-3 text-brand-ink/70">{lead.message}</td>
                  <td colSpan={3} className="px-3 py-3">
                    <form action={updateLeadAction} className="flex flex-wrap items-start gap-2">
                      <input type="hidden" name="id" value={lead.id} />
                      <select name="status" defaultValue={lead.status} className="rounded-md border border-brand-ink/20 bg-white px-2 py-1">
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <textarea
                        name="notes"
                        defaultValue={lead.notes}
                        rows={1}
                        className="min-w-[160px] flex-1 rounded-md border border-brand-ink/20 bg-white px-2 py-1"
                      />
                      <button type="submit" className="rounded-md bg-white px-3 py-1 font-semibold ring-1 ring-brand-ink/15 hover:bg-brand-bg">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-brand-ink/50">
                    No leads match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
