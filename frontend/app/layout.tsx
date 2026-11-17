import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EZY 2 LEARN Driving School - Admin Portal",
  description: "Central Management Platform for EZY 2 LEARN Driving School, Greater Sydney, NSW",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-pageBg text-textPrimary antialiased selection:bg-brandYellow-200 selection:text-navy-900">
        {children}
      </body>
    </html>
  );
}

