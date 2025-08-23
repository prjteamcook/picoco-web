import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Picoco - Photo Gallery",
  description: "Mobile photo gallery app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#191919]">
        {children}
      </body>
    </html>
  );
}
