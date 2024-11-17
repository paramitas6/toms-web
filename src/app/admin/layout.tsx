import AdminNav from "./_components/AdminNav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminNav />

      {/* Main Content Area */}
      <main className="flex-1 p-2 overflow-auto md:p-0 ">{children}</main>
    </div>

    
  );
}
