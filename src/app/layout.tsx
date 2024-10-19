import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { CartProvider } from "./(customerFacing)/_components/CartComponent";


const inter = Inter({ subsets: ["latin"],variable:"--font-sans" });

export const metadata: Metadata = {
  title: "Tom's",
  description:"Gamja",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <CartProvider>
      <body 
      className={cn("bg-background min-h-screen font-sans antialiased",
      inter.variable)}>{children}</body>
      </CartProvider>
    </html>
  );
}
