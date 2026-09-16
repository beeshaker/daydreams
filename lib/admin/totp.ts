import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";

const ISSUER = "Daydreams & Dumbbells Admin";

export function generateTotpSecret(): string {
  return generateSecret();
}

export async function verifyTotpCode(secret: string, code: string): Promise<boolean> {
  try {
    const result = await verify({ secret, token: code, epochTolerance: 30 });
    return result.valid;
  } catch {
    return false;
  }
}

export async function buildOtpAuthQrCode(username: string, secret: string): Promise<string> {
  const otpAuthUrl = generateURI({ issuer: ISSUER, label: username, secret });
  return QRCode.toDataURL(otpAuthUrl);
}
