import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ConfigProvider } from "antd";
import "./globals.css";
import AntdRegistry from "./AntdRegistry";
import AuthKeepAlive from "./components/AuthKeepAlive";
import RealtimeNotifications from './components/RealtimeNotifications';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Job Bridge - Find Your Dream Job",
    template: "%s | Job Bridge",
  },
  description: "The modern job portal connecting talent with opportunity.",
  icons: {
    icon: "/jobbridge-logo.svg",
    shortcut: "/jobbridge-logo.svg",
    apple: "/jobbridge-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#6366f1",
                colorInfo: "#6366f1",
                borderRadius: 12,
                fontFamily: "Inter, Arial, Helvetica, sans-serif",
              },
            }}
          >
            <div className="relative min-h-screen overflow-x-hidden">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.14),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_44%)]" />
              <AuthKeepAlive />
              <RealtimeNotifications />
              <main className="relative z-10 min-h-screen">{children}</main>
            </div>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}