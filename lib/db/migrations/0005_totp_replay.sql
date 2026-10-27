-- Start of the TOTP time step most recently accepted for this admin, so the
-- same 6-digit code can't be replayed within its validity window
-- (app/admin/login/actions.ts).
ALTER TABLE admin_users ADD COLUMN totp_last_used_epoch BIGINT;
