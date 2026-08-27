"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Renders nothing if no site key is configured — CAPTCHA is opt-in. Pairs
// with Supabase Auth's native Turnstile support: the token this produces
// is passed straight through as `options.captchaToken` on signUp /
// signInWithPassword, and Supabase verifies it server-side (enable the
// Turnstile provider under Authentication → Settings → Attack Protection
// in the Supabase dashboard, using the matching secret key).
export function Turnstile({ onVerify, onExpire }) {
  const containerId = `turnstile-${useId().replace(/:/g, "")}`;
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY) return;

    function render() {
      if (!window.turnstile || widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
        sitekey: SITE_KEY,
        callback: onVerify,
        "expired-callback": () => onExpire?.(),
        "error-callback": () => onExpire?.(),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          render();
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div id={containerId} />
    </>
  );
}

export const isCaptchaEnabled = Boolean(SITE_KEY);
