import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 18,
              background: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(251, 146, 60, 0.5)",
            }}
          >
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
              <path d="M8 5a4 4 0 018 0v6a4 4 0 01-8 0V5z" fill="#fff" />
              <path d="M19 11v1a7 7 0 11-14 0v-1" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 18v4M8 22h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#fff" }}>Talkflo</div>
          <div style={{ fontSize: 30, color: "#cbd5e1" }}>AI-powered voice-to-text transcription</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
