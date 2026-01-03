import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, IBM_Plex_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";



const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: '--font-ibm-plex-serif',
  weight: ['400', '500', '600', '700'],
});


export const metadata: Metadata = {
  title: "Sentivio",
  description: "Sentivio is a high-level emotional intelligence system that processes any video, interprets emotional states over time, and generates timelines, summaries, and analytics dashboard focusing solely on emotion, never identity. Designed as a professional-grade emotion-insight engine.",
  icons: {
    icon: "/assets/sentivio-logo.svg",
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
