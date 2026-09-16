import { NextResponse } from "next/server";
import { requireAdminSession, UnauthorizedError } from "@/lib/admin/session";
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

/**
 * Formats a single CSV field, guarding against two classes of CSV issues:
 *
 * 1. Spreadsheet formula injection: if the raw value starts with a
 *    character Excel/Google Sheets treats as a formula trigger (`=`, `+`,
 *    `-`, `@`, a tab, or a carriage return), prefix it with a leading `'`
 *    so it's read back as literal text rather than executed, e.g.
 *    `=cmd|'/c calc'!A1` becomes `'=cmd|'/c calc'!A1`.
 * 2. Standard CSV escaping: wrap the (possibly already-prefixed) value in
 *    quotes and double any embedded quotes when it contains a comma,
 *    quote, or newline.
 *
 * Order matters: the dangerous-prefix check runs against the original
 * value, then the leading `'` is prepended, and only then is the
 * comma/quote/newline check applied — the added `'` can itself introduce
 * a need for quoting depending on the rest of the content.
 */
export function csvField(value: unknown): string {
  const str = value === undefined || value === null ? "" : String(value);
  const needsFormulaGuard = /^[=+\-@\t\r]/.test(str);
  const safe = needsFormulaGuard ? `'${str}` : str;
  if (/[",\n]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export async function GET(request: Request) {
  // Defense in depth alongside proxy.ts's matcher: re-checks the session
  // (including that it hasn't been revoked via session_version) rather
  // than trusting proxy.ts alone.
  try {
    await requireAdminSession();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    throw error;
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
      "Cache-Control": "private, no-store",
    },
  });
}
