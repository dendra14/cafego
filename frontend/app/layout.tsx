import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css"; // INI ADALAH KUNCI AGAR TAILWIND TERBACA

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "CafeGo - Digital Menu",
  description: "Good mood, great coffee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <Script
          src="https://unpkg.com/@phosphor-icons/web"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen pb-24 selection:bg-cafe-accent selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
