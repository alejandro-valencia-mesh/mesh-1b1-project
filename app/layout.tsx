import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mesh Connect",
  description: "1B1 Mesh Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-800 text-white">{children}</body>
    </html>
  );
}
