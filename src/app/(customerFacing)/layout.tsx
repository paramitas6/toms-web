import CustomerNav from "@/components/CustomerNav";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="">
      <CustomerNav />

      <div className="container">{children}</div>
    </div>
  );
}
