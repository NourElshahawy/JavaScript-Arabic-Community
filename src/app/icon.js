import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

// Generated favicon: the same "JS" mark the navbar uses, on the brand color.
export default function Icon() {
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
          fontSize: 18,
          fontWeight: 700,
          borderRadius: 6,
        }}
      >
        JS
      </div>
    ),
    { ...size }
  );
}
