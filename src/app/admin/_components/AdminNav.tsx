// src/app/admin/_components/AdminNav.tsx

import { Nav, NavLink } from "@/components/Nav";
import {
  FaColumns,
  FaProductHunt,
  FaUsers,
  FaShoppingBag,
  FaNewspaper,
  FaUserPlus,
  FaCog,
  FaBars,
  FaShoppingCart,
  FaFileMedical,
} from "react-icons/fa";

export default function AdminLayout() {
  return (
    <>
      {/* Hidden Checkbox for Toggling Sidebar */}
      <input type="checkbox" id="sidebar-toggle" className="hidden peer" />

      {/* Mobile Header */}
      <header className="md:hidden bg-gray-800 text-white flex justify-between p-4">
        {/* Label acts as the toggle button */}
        <label
          htmlFor="sidebar-toggle"
          className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Toggle Sidebar"
        >
          <FaBars className="text-2xl" />
        </label>
      </header>

      {/* Sidebar */}
      <aside
        className={`
          fixed 
          inset-y-0 
          left-0 
          bg-gray-600
          text-white 
          w-52
          transform 
          -translate-x-full
          peer-checked:translate-x-0
          md:translate-x-0
          transition-transform 
          duration-200 
          ease-in-out
          z-50
          overflow-y-auto
        `}
        aria-hidden="true"
      >
        {/* Close Button for Mobile */}
        <label
          htmlFor="sidebar-toggle"
          className="absolute top-4 right-4 cursor-pointer md:hidden"
          aria-label="Close Sidebar"
        >
          <FaBars className="text-2xl" />
        </label>

        <div className="flex-1 flex flex-col py-10">
          <Nav lightmode={false} direction="col">
            {/* Primary Links */}

            <NavLink
              href="/admin/orders"
              className="flex flex-row space-x-3  justify-start  py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaShoppingBag className="text-xl" />
              <span>Orders</span>
            </NavLink>

            <NavLink
              href="/admin/orders/new"
              className="flex  flex-row space-x-3 justify-start  py-2  rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaFileMedical className="text-xl" />
              <span>New Order</span>
            </NavLink>

            {/* <NavLink
              href="/admin/orders/quick"
              className="flex  flex-row space-x-3  justify-start  py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaShoppingCart className="text-xl" />
              <span>Quick Order</span>
            </NavLink> */}
            {/* Divider */}
            <hr className="my-4 border-gray-700 w-full" />

            {/* Secondary Links */}

            <NavLink
              href="/admin/users"
              className="flex  flex-row space-x-3 justify-start  py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaUsers className="text-xl" />
              <span>Customers</span>
            </NavLink>
            <NavLink
              href="/admin/users/new"
              className="flex  flex-row space-x-3 justify-start  py-2  rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaUserPlus className="text-xl" />
              <span>New Customer</span>
            </NavLink>

            {/* Divider */}
            <hr className="my-4 border-gray-700 w-full" />

            {/* Settings Links */}
            <NavLink
              href="/admin/products"
              className="flex  flex-row space-x-3 justify-start  py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaProductHunt className="text-xl" />
              <span>Products</span>
            </NavLink>

            <NavLink
              href="/admin/carousel"
              className="flex flex-row space-x-3  justify-start  py-2 rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaCog className="text-xl" />
              <span>Images</span>
            </NavLink>

            <NavLink
              href="/admin/calendar"
              className="flex flex-row space-x-3 justify-start  py-2  rounded hover:bg-gray-700 focus:bg-gray-700 focus:outline-none"
            >
              <FaColumns className="text-xl" />
              <span>Dashboard</span>
            </NavLink>
          </Nav>
        </div>
      </aside>

      {/* Overlay for Mobile when Sidebar is Open */}
      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 bg-black opacity-50 z-40 md:hidden peer-checked:block hidden"
        aria-hidden="true"
      ></label>

      {/* Main Content */}
      <main className="ml-0 md:ml-52 transition-all duration-200">
        {/* Your main admin content goes here */}
      </main>
    </>
  );
}
