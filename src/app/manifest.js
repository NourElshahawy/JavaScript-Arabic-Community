export default function manifest() {
  return {
    name: "JavaScript Arabic Community",
    short_name: "JS Arabic",
    description: "مجتمع عربي لمطوري JavaScript: أسئلة وإجابات، نقاشات، أخبار، وتجارب انترفيو.",
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    background_color: "#0e1116",
    theme_color: "#3457d5",
    icons: [{ src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" }],
  };
}
