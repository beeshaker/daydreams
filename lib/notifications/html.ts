/**
 * Copied from the private helper in lib/leads/email.ts (not exported there,
 * and that file should stay untouched) rather than imported.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
