import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 28,
            backgroundColor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 24,
            padding: "32px 48px",
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Mic icon */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 20,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Simple mic glyph */}
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path d="M8 5a4 4 0 018 0v6a4 4 0 01-8 0V5z" fill="#fff" />
              <path d="M19 11v1a7 7 0 11-14 0v-1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 18v4M8 22h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 72,
                lineHeight: 1,
                fontWeight: 800,
                color: "#fff",
                letterSpacing: -1.5,
              }}
            >
              Talkflo
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 34,
                color: "#FFF3E5",
                fontWeight: 500,
              }}
            >
              Turn your voice into perfect text
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
