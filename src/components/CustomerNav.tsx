"use client";

import Link from "next/link";
import { Nav, NavLink } from "./Nav";
import Image from "next/image";
import { ShoppingBag, User } from "lucide-react";
import logob from "/public/logo.svg";
import { useContext, useState } from "react";
import CartContext from "@/app/(customerFacing)/_components/CartComponent"; // Adjust the path as needed

export default function CustomerNav() {
  const { cart } = useContext(CartContext); 
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-red-100 flex flex-col items-center py-1 text-black text-sm font-light font-montserrat">
        <p>Come visit us! </p>
        <p>572 Eglinton Avenue West</p>
        <p>(647)352-9188</p>
      </div>

      {/* Main Navbar */}
      <div className="flex items-center py-2 bg-black sm:flex-row sm:justify-between">
        {/* Logo - Make sure it's centered on mobile */}
        <div className="pl-6 w-full flex justify-center sm:w-1/3">
          <Link href="/">
            <Image src={logob} alt="Tom's Logo" width={300} />
          </Link>
        </div>

        {/* Hamburger Icon for mobile */}
        <div className="flex justify-start sm:hidden">
          <button onClick={toggleMenu} className="cursor-pointer" aria-label="Toggle menu">
            <div className="w-18 h-18 pr-5 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </button>
        </div>

        {/* Navigation Links (visible on larger screens) */}
        <div className="w-full justify-end font-kuhlenbach text-2xl border-secondary text-white hidden sm:flex sm:flex-row">
          <Nav direction="row" lightmode={false}>
            <NavLink href="/shop">Shop</NavLink>
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/about">About</NavLink>
          </Nav>
        </div>

        {/* User and Cart Icons */}
        <div className="space-x-3 justify-end px-20 hidden sm:flex items-center">
          <User color={"white"} />
          <Link href="/cart">
            <div className="relative">
              <ShoppingBag color={"white"} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-400 rounded-full">
                  {totalItems}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[250px] bg-black transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } z-50 text-2xl border-secondary text-white font-kuhlenbach flex flex-col items-start pl-4 pt-20`}
      >
        {/* Close Menu Button */}
        <button onClick={toggleMenu} className="absolute top-4 right-4 cursor-pointer z-10" aria-label="Close menu">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="2"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </button>

        {/* Menu Content */}
        <NavLink href="/shop" onClick={toggleMenu}>Shop</NavLink>
        <NavLink href="/services" onClick={toggleMenu}>Services</NavLink>
        <NavLink href="/about" onClick={toggleMenu}>About</NavLink>
        <hr className="m-4 w-3/4 border-t border-white-700" />
        {/* Account and Basket Links */}
        <div className="flex flex-col space-y-3 pt-4">
          <NavLink href="/account" onClick={toggleMenu}>
            Account
          </NavLink>
          <NavLink href="/cart" onClick={toggleMenu}>
            Basket
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-400 rounded-full">
                {totalItems}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </>
  );
}
