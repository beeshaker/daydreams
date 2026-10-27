import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/session";
import { getDb } from "@/lib/db/client";
import { startMfaEnrollmentAction } from "./actions";
import { MfaEnrollForm } from "./MfaEnrollForm";

export const metadata = {
  title: "Admin — Enable MFA",
};

// Never statically prerender — every admin page depends on the session
// cookie and must always be private, no-store.
export const dynamic = "force-dynamic";

export default async function AdminMfaSettingsPage() {
  const session = await requireAdminPage({ allowWithoutMfa: true });

  const pool = await getDb();
  const { rows } = await pool.query<{ totp_enabled: boolean }>(
    "SELECT totp_enabled FROM admin_users WHERE id = $1",
    [session.userId],
  );
  if (rows[0]?.totp_enabled) {
    return (
      <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold">Two-factor authentication is on</h1>
          <p className="mt-2 text-sm text-brand-ink/70">
            Your account already requires a code from your authenticator app at sign-in. If you lose
            access to it, ask whoever manages the server to reset it.
          </p>
          <Link href="/admin/leads" className="mt-6 inline-block text-sm text-brand-lavender-strong underline">
            ← Back to leads
          </Link>
        </div>
      </div>
    );
  }

  const { secret, qrCodeDataUrl } = await startMfaEnrollmentAction();

  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">Enable two-factor authentication</h1>
        <p className="mt-2 text-sm text-brand-ink/70">
          Scan this QR code with an authenticator app (e.g. Google Authenticator, 1Password), then
          enter the 6-digit code it generates to confirm setup.
        </p>

        {qrCodeDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- data: URL QR code, next/image doesn't apply
          <img src={qrCodeDataUrl} alt="Scan with your authenticator app" className="mt-6 h-48 w-48" />
        )}

        {secret && (
          <p className="mt-2 text-xs text-brand-ink/60">
            Can&apos;t scan? Enter this code manually: <code className="font-mono">{secret}</code>
          </p>
        )}

        <MfaEnrollForm secret={secret ?? ""} />
      </div>
    </div>
  );
}
