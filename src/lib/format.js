const UNITS = [
  { limit: 60, divisor: 1, unit: "seconds" },
  { limit: 3600, divisor: 60, unit: "minutes" },
  { limit: 86400, divisor: 3600, unit: "hours" },
  { limit: 2592000, divisor: 86400, unit: "days" },
  { limit: 31536000, divisor: 2592000, unit: "months" },
  { limit: Infinity, divisor: 31536000, unit: "years" },
];

const arabicRtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

export function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  const bucket = UNITS.find((u) => seconds < u.limit);
  const value = Math.floor(seconds / bucket.divisor);
  return arabicRtf.format(-value, bucket.unit);
}

export function formatCount(value) {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value % 1000 >= 100 ? 1 : 0)}ألف`;
  return `${(value / 1_000_000).toFixed(1)}م`;
}
