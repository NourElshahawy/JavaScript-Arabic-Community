import Image from "next/image";

const SIZE_CLASS = {
  xs: "avatar--xs",
  sm: "avatar--sm",
  md: "",
  lg: "avatar--lg",
  xl: "avatar--xl",
};

const SIZE_PX = { xs: 20, sm: 28, md: 40, lg: 64, xl: 96 };

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
    return (
      <span className={classes}>
        <Image src={src} alt={name || ""} fill sizes={`${SIZE_PX[size]}px`} style={{ objectFit: "cover" }} />
      </span>
    );
  }

  return <span className={classes}>{initials(name)}</span>;
}
