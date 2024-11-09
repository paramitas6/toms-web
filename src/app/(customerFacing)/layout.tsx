// src/app/(customerFacing)/layout.tsx

import CustomerNav from "@/app/(customerFacing)/_components/CustomerNav";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
  );
}
