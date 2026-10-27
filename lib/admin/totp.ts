import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";

const ISSUER = "Daydreams & Dumbbells Admin";

export function generateTotpSecret(): string {
  return generateSecret();
}

export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
  return (await matchTotpCode(secret, code)) !== null;
}

/**
 * Like verifyTotpCode, but returns the epoch (seconds) of the time step the
 * code matched, or null — callers persist it to reject replays of the same
 * code.
 */
export async function matchTotpCode(secret: string, code: string): Promise<number | null> {
  try {
    const result = await verify({ secret, token: code, epochTolerance: 30 });
    if (!result.valid) return null;
    // verify() is typed as a TOTP/HOTP union; only the TOTP side has epoch.
    return "epoch" in result ? result.epoch : (Math.floor(Date.now() / 30_000) + result.delta) * 30;
  } catch {
    return null;
  }
}

export async function buildOtpAuthQrCode(username: string, secret: string): Promise<string> {
  const otpAuthUrl = generateURI({ issuer: ISSUER, label: username, secret });
  return QRCode.toDataURL(otpAuthUrl);
}
