import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const alt = "JavaScript Arabic Community";

// Default social-share card. Text is kept Latin so it renders correctly
// with the built-in font; add a bundled Arabic face here if a localized
// card is wanted later.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 24,
          padding: 96,
          background: "#0e1116",
          color: "#e8e9ec",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "#3457d5",
            color: "#fff",
            fontSize: 60,
            fontWeight: 700,
          }}
        >
          JS
        </div>
        <div style={{ fontSize: 68, fontWeight: 700 }}>JavaScript Arabic Community</div>
        <div style={{ fontSize: 34, color: "#a9adb6" }}>
          Q&amp;A · Discussions · News · Interview experiences
        </div>
      </div>
    ),
    { ...size }
  );
}
