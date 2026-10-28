import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummyHash: Promise<string> | undefined;

/**
 * verifyPassword() against a real admin's hash, or — when there's no such
 * admin — against a genuine bcrypt hash of a random string at the same cost
 * factor, so an unknown username takes as long to reject as a wrong
 * password and the response time doesn't reveal which usernames exist. (A
 * malformed placeholder hash doesn't work: bcrypt rejects it instantly.)
 */
export async function verifyPasswordOrDummy(password: string, hash: string | undefined): Promise<boolean> {
  if (hash) return verifyPassword(password, hash);
  dummyHash ??= hashPassword(crypto.randomUUID());
  await verifyPassword(password, await dummyHash);
  return false;
}
