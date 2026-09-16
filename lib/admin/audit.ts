import type { PoolClient } from "pg";
import { getDb } from "@/lib/db/client";

export type AuditLogEntry = {
  actorId: string | null;
  actorUsername: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
};

/**
 * Records an admin action. Accepts an optional `client` so callers that
 * need the audit entry to commit-or-rollback together with another write
 * (e.g. a lead status update) can pass a transaction client from
 * withTransaction() instead of grabbing a separate connection.
 */
export async function logAdminAction(
  entry: AuditLogEntry,
  client?: PoolClient,
): Promise<void> {
  const runner = client ?? (await getDb());
  await runner.query(
    `INSERT INTO audit_log (actor_id, actor_username, action, target_type, target_id, metadata, ip)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      entry.actorId,
      entry.actorUsername,
      entry.action,
      entry.targetType ?? null,
      entry.targetId ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      entry.ip ?? null,
    ],
  );
}
