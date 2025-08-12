import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import { GoogleAnalyticsTracker } from "@/components/ga-tracker";
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
  applicationName: "Talkflo",
  authors: [{ name: "Talkflo" }],
  generator: "Next.js",
  category: "Productivity",
  creator: "Talkflo",
  publisher: "Talkflo",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Talkflo - Turn Voice to Text with AI",
    description: "Transform your spoken ideas into polished text instantly. AI-powered voice-to-text transcription.",
    url: defaultUrl,
    siteName: "Talkflo",
    images: [
      {
        url: "/opengraph-image",
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
    images: ["/twitter-image"],
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
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
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        {/* Google Analytics (optional) */}
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-setup" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
            </Script>
          </>
        ) : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
          {/* Track SPA navigations for GA when configured */}
          {gaId ? (
            <Suspense fallback={null}>
              <GoogleAnalyticsTracker measurementId={gaId} />
            </Suspense>
          ) : null}
            {children}
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
