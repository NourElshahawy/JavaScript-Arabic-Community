const VARIANT_CLASS = {
  brand: "badge--brand",
  success: "badge--success",
  warning: "badge--warning",
  danger: "badge--danger",
  neutral: "badge--neutral",
};

export function Badge({ variant = "neutral", children, className = "" }) {
  return <span className={`badge ${VARIANT_CLASS[variant]} ${className}`.trim()}>{children}</span>;
}
