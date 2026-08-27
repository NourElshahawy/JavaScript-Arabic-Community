import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3457d5",
          color: "#fff",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        JS
      </div>
    ),
    { ...size }
  );
}
