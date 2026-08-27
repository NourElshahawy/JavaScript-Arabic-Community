import Script from "next/script";

// No-op unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set - nothing loads, no
// third-party request happens, until a self-hosted or plausible.io domain
// is configured. Plausible is cookie-less and doesn't need a consent
// banner under GDPR, which is why it's the default here over something
// like GA that would.
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src={`${process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js"}`}
      strategy="afterInteractive"
    />
  );
}
