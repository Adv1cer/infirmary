"use client";
import { Prompt } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

const PromptSans = Prompt({
  weight: ["400"],
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <SessionProvider>
      <body className={`${PromptSans} antialiased`}>
          {(pathname === "/" || pathname === "/Login" ) && <Navbar />}
          <Toaster position="bottom-center" />
          {children}
          {(pathname === "/" || pathname === "/Login" ) && <Footer />}
          
      </body>
      </SessionProvider>
    </html>
  );
}