import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Talkflo - Turn Voice to Text with AI",
    template: "%s | Talkflo",
  },
  description: "Transform your spoken ideas into polished text instantly. Talkflo is an AI-powered voice-to-text transcription service that helps you capture, organize, and write with ease.",
  keywords: ["voice to text", "transcription", "AI writing", "dictation", "voice notes", "speech to text"],
  openGraph: {
    title: "Talkflo - Turn Voice to Text with AI",
    description: "Transform your spoken ideas into polished text instantly. AI-powered voice-to-text transcription.",
    url: defaultUrl,
    siteName: "Talkflo",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Talkflo - Turn Voice to Text with AI",
    description: "Transform your spoken ideas into polished text instantly. AI-powered voice-to-text transcription.",
    images: ["/twitter-image.png"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
