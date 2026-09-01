import { NextResponse } from "next/server";
import { isValidAdminAuth } from "@/lib/admin/auth";
import { CSV_TEMPLATE_HEADER, CSV_TEMPLATE_EXAMPLE_ROW } from "@/lib/classes/csv";

export async function GET(request: Request) {
  if (!isValidAdminAuth(request.headers.get("authorization"))) {
    return new Response(null, {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin"' },
    });
  }

  const csv = `${CSV_TEMPLATE_HEADER}\n${CSV_TEMPLATE_EXAMPLE_ROW}\n`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="class-occurrences-template.csv"',
    },
  });
}
