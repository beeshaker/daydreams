import { requireAdminSession } from "@/lib/admin/session";
import { startMfaEnrollmentAction } from "./actions";
import { MfaEnrollForm } from "./MfaEnrollForm";

export const metadata = {
  title: "Admin — Enable MFA",
};

// Never statically prerender — every admin page depends on the session
// cookie and must always be private, no-store.
export const dynamic = "force-dynamic";

export default async function AdminMfaSettingsPage() {
  await requireAdminSession();
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
