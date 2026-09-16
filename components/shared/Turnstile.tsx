"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; "expired-callback"?: () => void },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Renders nothing (and calls onVerify with an empty token) when siteKey is
 * empty — this is the deliberate dev-mode graceful skip until the user
 * provisions a real Cloudflare Turnstile site and supplies
 * TURNSTILE_SITE_KEY.
 */
export function Turnstile({
  siteKey,
  onVerify,
}: {
  siteKey: string;
  onVerify: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const elementId = useId();

  useEffect(() => {
    if (!siteKey || !containerRef.current || !window.turnstile) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
    });
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
    // Re-render only if the site key changes; onVerify is expected to be stable-ish per form instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (containerRef.current && window.turnstile && !widgetIdRef.current) {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              callback: onVerify,
            });
          }
        }}
      />
      <div ref={containerRef} id={`turnstile-${elementId}`} />
    </>
  );
}
