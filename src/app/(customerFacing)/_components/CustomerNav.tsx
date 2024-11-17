// src/components/CustomerNav.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User } from "lucide-react";
import logo from "/public/tomslogo.png";
import { Nav, NavLink } from "../../../components/Nav";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

const CustomerNav: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Placeholder for cart context
  // Replace with your actual cart context
  const totalItems = 0; // Replace with actual total items from cart context

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-red-100 flex flex-col items-center py-1 text-black text-sm font-light font-montserrat">
        <p>Come visit us!</p>
        <p>572 Eglinton Avenue West</p>
        <p>(647)352-9188</p>
      </div>

      {/* Main Navbar */}
      <div className="navbar sticky top-0 z-50 ">
        <div className="navbar-content flex items-center py-2 sm:justify-between">
          {/* Logo */}
          <div className="pl-6 w-full flex justify-center sm:w-1/3">
            <Link href="/">
              <Image src={logo} priority alt="Tom's Logo" width={300} />
            </Link>
          </div>

          {/* Hamburger Icon for Mobile */}
          <div className="flex justify-start sm:hidden">
            <button onClick={toggleMenu} aria-label="Toggle menu">
              <div className="w-18 h-18 pr-5 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="white"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden sm:flex w-full justify-end text-white">
            <Nav className="space-x-4" direction="row" lightmode={false}>
              <NavLink className="font-gotham" href="/shop">
                Shop
              </NavLink>
              <NavLink href="/services">Services</NavLink>
              <NavLink href="/about">About</NavLink>
            </Nav>
          </div>

          {/* Cart and User Icons */}
          <div className="hidden sm:flex items-center space-x-3 px-20 relative">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center focus:outline-none"
                  aria-label="User menu"
                >
                  <User color="white" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-1 z-20">
                    {/* <Link
                      href="/account-settings"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Account Settings
                    </Link> */}
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      View Orders
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <User color="white" />
              </Link>
            )}
            <Link href="/cart">
              <div className="relative">
                <ShoppingBag color="white" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold bg-red-400 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar for Mobile */}
      <div
        className={`fixed top-0 right-0 h-full w-[250px] bg-black transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } z-50 flex flex-col pl-4 pt-20`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4"
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth="2"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <NavLink className="text-white"href="/shop" onClick={toggleMenu}>
          Shop
        </NavLink>
        <NavLink  className="text-white" href="/services" onClick={toggleMenu}>
          Services
        </NavLink>
        <NavLink  className="text-white" href="/about" onClick={toggleMenu}>
          About
        </NavLink>
        <hr/>
        {user && (
          <>
            {/* <NavLink href="/account-settings" onClick={toggleMenu}>
              Account Settings
            </NavLink> */}
            <NavLink className="text-white" href="/orders" onClick={toggleMenu}>
              View Orders
            </NavLink>
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
                toggleMenu();
              }}
              className="text-left px-4 py-2 text-sm hover:bg-gray-700"
            >
              Logout
            </button>
          </>
        )}
        {!user && (
          <NavLink className="text-white" href="/login" onClick={toggleMenu}>
            Login / Sign Up
          </NavLink>
        )}
      </div>
    </>
  );
};

export default CustomerNav;
