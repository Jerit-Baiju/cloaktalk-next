import { AccessControlWrapper } from "@/components/AccessControlWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatWebSocketProvider } from "@/contexts/ChatWebSocketContext";
import { QueueWebSocketProvider } from "@/contexts/QueueWebSocketContext";
import { WebSocketManagerProvider } from "@/contexts/WebSocketManagerContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CloakTalk - Secure Student Communication",
  description: "Connect securely with your peers and classmates within your organization. CloakTalk provides safe, private messaging for students.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CloakTalk",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192" },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CloakTalk" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/icon-192x192.png" color="#000000" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <QueueWebSocketProvider>
            <ChatWebSocketProvider>
              <WebSocketManagerProvider>
                <AccessControlWrapper>
                  {children}
                </AccessControlWrapper>
              </WebSocketManagerProvider>
            </ChatWebSocketProvider>
          </QueueWebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
