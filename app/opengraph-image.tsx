import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0b0d",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at 50% 40%, rgba(232,35,43,0.35) 0%, transparent 60%)",
          }}
        />
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 24 }}>
          <path d="M4 20 L12 4 L20 20 L12 16 Z" fill="#e8232b" />
        </svg>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#f4f3ef",
            letterSpacing: -2,
            display: "flex",
          }}
        >
          APEX
        </div>
        <div
          style={{
            fontSize: 30,
            color: "#f2b633",
            marginTop: 8,
            letterSpacing: 4,
            display: "flex",
          }}
        >
          RACING SIMULATOR
        </div>
        <div style={{ fontSize: 24, color: "#9a9da6", marginTop: 24, display: "flex" }}>
          {BUSINESS.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
