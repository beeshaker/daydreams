import { NextResponse } from "next/server";
import { isValidAdminAuth } from "@/lib/admin/auth";
import { listLeads, type LeadStatus } from "@/lib/leads/store";

const COLUMNS = [
  "id",
  "createdAt",
  "status",
  "leadType",
  "source",
  "parentName",
  "email",
  "phone",
  "childAge",
  "preferredContact",
  "message",
  "notes",
] as const;

function csvField(value: unknown): string {
  const str = value === undefined || value === null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  if (!isValidAdminAuth(request.headers.get("authorization"))) {
    return new Response(null, {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const leadType = url.searchParams.get("leadType") ?? undefined;
  const search = url.searchParams.get("search") ?? undefined;

  const leads = await listLeads({
    status: status as LeadStatus | undefined,
    leadType: leadType as "daycare-interest" | "gym-interest" | undefined,
    search,
  });

  const rows = [
    COLUMNS.join(","),
    ...leads.map((lead) => COLUMNS.map((column) => csvField(lead[column])).join(",")),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
