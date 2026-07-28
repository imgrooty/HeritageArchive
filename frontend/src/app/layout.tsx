import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Rozha_One, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const rozhaOne = Rozha_One({
  variable: "--font-rozha-one",
  subsets: ["latin", "devanagari"],
  weight: ["400"],
});

const notoDevanagari = Noto_Serif_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cultural Heritage Archive — Preserving Local Traditions & Stories",
  description: "A community-driven digital archive dedicated to documenting, translating, and mapping local cultural heritage, historical sites, and traditional practices.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${rozhaOne.variable} ${notoDevanagari.variable} h-full w-full max-w-full overflow-x-hidden antialiased bg-[#07070a]`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden bg-[#07070a] text-[#f4f4f7] font-sans">
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                var isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                if (isDev) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var reg of registrations) {
                      reg.unregister();
                    }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (var name of names) {
                        caches.delete(name);
                      }
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              }
            `
          }}
        />
      </body>
    </html>
  );
}
