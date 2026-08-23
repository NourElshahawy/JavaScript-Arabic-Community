const SIZE_CLASS = {
  xs: "avatar--xs",
  sm: "avatar--sm",
  md: "",
  lg: "avatar--lg",
  xl: "avatar--xl",
};

function initials(name) {
  if (!name) return "؟";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + second).toUpperCase();
}

export function Avatar({ src, name, size = "md", className = "" }) {
  const classes = ["avatar", SIZE_CLASS[size], className].filter(Boolean).join(" ");

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <span className={classes}>
        <img src={src} alt={name || ""} />
      </span>
    );
  }

  return <span className={classes}>{initials(name)}</span>;
}
