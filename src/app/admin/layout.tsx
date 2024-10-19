import { Nav, NavLink } from "@/components/Nav";
import { FaColumns, FaProductHunt, FaUsers, FaShoppingBag } from "react-icons/fa";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col justify-between">
        <Nav lightmode={false} direction="col">
          <NavLink href="/admin">
            <FaColumns className="text-4xl"/>
            Dashboard
          </NavLink>
          <NavLink href="/admin/products">
            <FaProductHunt className="text-4xl"/>
            Products
          </NavLink>
          <NavLink href="/admin/users">
            <FaUsers className="text-4xl"/>
            Customers
          </NavLink>
          <NavLink href="/admin/orders">
            <FaShoppingBag className="text-4xl"/>
            Orders
          </NavLink>
        </Nav>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}