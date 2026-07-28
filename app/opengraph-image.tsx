import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BUSINESS } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const logoData = await readFile(join(process.cwd(), "public/logo/apex-logo.png"), "base64");
  const logoSrc = `data:image/png;base64,${logoData}`;

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
        <img src={logoSrc} width={560} height={160} alt="" style={{ objectFit: "contain" }} />
        <div style={{ fontSize: 24, color: "#9a9da6", marginTop: 28, display: "flex" }}>
          {BUSINESS.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
