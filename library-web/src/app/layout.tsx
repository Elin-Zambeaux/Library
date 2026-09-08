import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Library",
  description: "Browse, borrow and return books",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <span className="brand">Elins Library</span>
            <nav className="site-nav">
              <Link href="/customer">Customer</Link>
              <Link href="/librarian">Librarian</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
