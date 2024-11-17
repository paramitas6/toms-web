// src/app/(customerFacing)/layout.tsx
"use client"

import CustomerNav from "@/app/(customerFacing)/_components/CustomerNav";
import { SessionProvider } from "next-auth/react";
export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
    <>
    <div className="flex flex-col min-h-screen">
      <CustomerNav />

      {/* Main Content Area */}
      <div className="flex-grow">{children}</div>
    </div>
    <footer>
    <h1 className="text-center font-oSans">@2024 Tom's Florist - All Rights Reserved</h1>
    </footer>
    </>
    </SessionProvider>
  );
}
