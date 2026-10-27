#!/usr/bin/env bash
# One-shot setup for Daydreams & Dumbbells on a SHARED VPS.
#
# Run as the `deploy` user (NOT root):   bash setup-vps.sh
# It asks for your sudo password once, for the Nginx/systemd/certbot steps.
# Safe to re-run: every step checks whether it's already done.
#
# Footprint (everything this adds, so it can be removed cleanly later —
# see "Removing" in docs/deployment.md):
#   ~/.nvm                                   Node 22, for this app only (system Node 18 untouched)
#   ~/.ssh/daydreams_deploy + ~/.ssh/config  read-only GitHub deploy key
#   /var/www/daydreams                       the app
#   /etc/systemd/system/daydreams.service    runs the app on 127.0.0.1:$PORT
#   /etc/nginx/sites-available/daydreams     reverse proxy (+ symlink in sites-enabled)
#   /etc/nginx/conf.d/daydreams-limits.conf  rate-limit zones for the above (http context)
#   Let's Encrypt cert for $DOMAIN only
set -euo pipefail

DOMAIN="daydreamsanddumbbells.com"
PORT=3001
APP_DIR=/var/www/daydreams
REPO="git@github-daydreams:beeshaker/daydreams.git"
NODE_MAJOR=22
NVM_VERSION=v0.40.3

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31mSTOP: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] && die "run this as the deploy user, not root"

step "Preflight"
if ss -tln | grep -q "127.0.0.1:$PORT " && ! systemctl is-active --quiet daydreams; then
  die "port $PORT is already used by something else — pick another PORT at the top of this script"
fi
sudo -v

step "GitHub deploy key"
if [ ! -f ~/.ssh/daydreams_deploy ]; then
  ssh-keygen -q -t ed25519 -C "daydreams-deploy@$(hostname)" -f ~/.ssh/daydreams_deploy -N ""
fi
if ! grep -q "Host github-daydreams" ~/.ssh/config 2>/dev/null; then
  printf 'Host github-daydreams\n  HostName github.com\n  User git\n  IdentityFile ~/.ssh/daydreams_deploy\n  IdentitiesOnly yes\n' >> ~/.ssh/config
  chmod 600 ~/.ssh/config
fi
# `ssh -T` to GitHub always exits 1 (no shell access), even on success —
# capture the output first so pipefail doesn't turn that into a failure.
gh_auth="$(ssh -o StrictHostKeyChecking=accept-new -T github-daydreams 2>&1 || true)"
if ! grep -q "successfully authenticated" <<<"$gh_auth"; then
  echo "Add this key at https://github.com/beeshaker/daydreams/settings/keys (leave 'Allow write access' OFF):"
  echo
  cat ~/.ssh/daydreams_deploy.pub
  die "deploy key not authorised yet — add it, then re-run this script"
fi

step "Node $NODE_MAJOR via nvm (user-local)"
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/$NVM_VERSION/install.sh" | PROFILE=/dev/null bash
fi
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install "$NODE_MAJOR" >/dev/null
nvm use "$NODE_MAJOR" >/dev/null
NODE_BIN="$(nvm which "$NODE_MAJOR")"
NODE_DIR="$(dirname "$NODE_BIN")"
echo "node $("$NODE_BIN" -v) at $NODE_BIN"

step "Code"
if [ ! -d "$APP_DIR/.git" ]; then
  sudo mkdir -p "$APP_DIR"
  sudo chown "$USER:$USER" "$APP_DIR"
  git clone "$REPO" "$APP_DIR"
else
  git -C "$APP_DIR" pull --ff-only
fi
cd "$APP_DIR"

step "Environment (.env.local)"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  chmod 600 .env.local
  sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$DOMAIN|" .env.local
  sed -i "s|^TRUSTED_PROXY_HOPS=.*|TRUSTED_PROXY_HOPS=1|" .env.local
  sed -i "s|^SESSION_SECRET=.*|SESSION_SECRET=$(openssl rand -base64 48 | tr -d '\n')|" .env.local
  echo "Created $APP_DIR/.env.local (site URL, proxy hops and a fresh SESSION_SECRET filled in)."
  echo "Fill in the rest — at minimum DATABASE_URL — with:  nano $APP_DIR/.env.local"
  die "fill in .env.local, then re-run this script"
fi
# Keep the site URL in sync with $DOMAIN — it's baked in at build time and
# must match PRODUCTION_URL in lib/seo.ts or robots.txt blocks all crawling.
sed -i "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$DOMAIN|" .env.local
grep -q '^DATABASE_URL=.\+' .env.local || die "DATABASE_URL is empty in .env.local"
grep -q '^TURNSTILE_SECRET_KEY=.\+' .env.local || echo "WARNING: TURNSTILE_SECRET_KEY empty — lead forms have no bot check until it's set"

step "Install, migrate, build"
npm ci
npx tsx --env-file=.env.local scripts/migrate.ts
npm run build

step "systemd service"
sudo tee /etc/systemd/system/daydreams.service >/dev/null <<EOF
[Unit]
Description=Daydreams & Dumbbells (Next.js)
After=network.target

[Service]
User=$USER
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PATH=$NODE_DIR:/usr/bin:/bin
ExecStart=$NODE_BIN $APP_DIR/node_modules/next/dist/bin/next start -H 127.0.0.1 -p $PORT
Restart=on-failure
RestartSec=5

# Hardening — this box is shared with other projects
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=$APP_DIR/.next
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictSUIDSGID=true
LockPersonality=true
# The app runs as the deploy user, so keep it away from that user's SSH keys
# (and the GitHub deploy key) even though ProtectHome allows reading ~.
InaccessiblePaths=-$HOME/.ssh
CapabilityBoundingSet=
ProtectKernelLogs=true
ProtectClock=true
ProtectHostname=true
RestrictNamespaces=true
RestrictRealtime=true
RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX
SystemCallArchitectures=native
UMask=0077

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable daydreams >/dev/null 2>&1
sudo systemctl restart daydreams
sleep 4
curl -fsS -o /dev/null "http://127.0.0.1:$PORT/" || die "app didn't come up — check: sudo journalctl -u daydreams -n 50"
echo "app is answering on 127.0.0.1:$PORT"

step "Nginx site (existing sites untouched)"
grep -q "conf.d/\*.conf" /etc/nginx/nginx.conf || die "nginx.conf doesn't include conf.d/*.conf — add the limit_req_zone lines by hand"
# limit_req_zone is only valid in the http block, hence its own conf.d file.
# Zone names are prefixed so they can't collide with other sites on the box.
sudo tee /etc/nginx/conf.d/daydreams-limits.conf >/dev/null <<'LIMITS'
limit_req_zone $binary_remote_addr zone=daydreams_forms:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=daydreams_general:10m rate=20r/s;
LIMITS
if [ ! -f /etc/nginx/sites-available/daydreams ]; then
  sudo tee /etc/nginx/sites-available/daydreams >/dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 2m;
    server_tokens off;
    limit_req_status 429;

    # Security headers (HSTS, CSP, X-Frame-Options, ...) are set by the app
    # itself (next.config.ts, proxy.ts) so they travel with it to any host;
    # don't duplicate them here.

    # Lead forms, admin login and voice-agent tokens: throttled at the edge
    # too, before a request ever reaches Node or Postgres.
    location ~ ^/(api/|admin/login) {
        limit_req zone=daydreams_forms burst=10 nodelay;
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$host;
    }

    location / {
        limit_req zone=daydreams_general burst=100 nodelay;
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        # Overwrite, never pass through — lib/http/clientIp.ts trusts these for rate limiting
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF
  sudo ln -sf /etc/nginx/sites-available/daydreams /etc/nginx/sites-enabled/daydreams
fi
sudo nginx -t || die "nginx config test failed — NOT reloading, other sites are safe"
sudo systemctl reload nginx

step "HTTPS certificate (this domain only)"
if ! sudo certbot certificates 2>/dev/null | grep -q "Domains: .*$DOMAIN"; then
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --redirect
fi
sudo nginx -t && sudo systemctl reload nginx

step "Check"
curl -fsS -o /dev/null -w "https://$DOMAIN -> %{http_code}\n" "https://$DOMAIN/"
echo
echo "Done. Live at https://$DOMAIN"
echo "If this is a fresh database, create the admin:  cd $APP_DIR && npx tsx --env-file=.env.local scripts/seed-admin.ts"
