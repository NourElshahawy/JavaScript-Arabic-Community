const VARIANT_CLASS = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  outline: "btn--outline",
  ghost: "btn--ghost",
  danger: "btn--danger",
};

const SIZE_CLASS = {
  sm: "btn--sm",
  md: "",
  lg: "btn--lg",
};

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  icon = false,
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    icon ? "btn btn--icon" : "btn",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    full ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...props} />;
}
