import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: '--font-ibm-plex-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});


export const metadata: Metadata = {
  title: {
    default: "Sentivio",
    template: "%s | Sentivio",
  },
  description: "Sentivio is a high-level emotional intelligence system that processes any video, interprets emotional states over time, and generates timelines, summaries, and analytics dashboard focusing solely on emotion, never identity. Designed as a professional-grade emotion-insight engine.",
  icons: {
    icon: "/assets/sentivio-logo3.svg",
  },
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
