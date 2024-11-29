// src/components/CustomerNav.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, User, ChevronDown, ChevronUp } from "lucide-react";
import logo from "/public/tomslogo.png";
import { Nav, NavLink } from "../../../components/Nav";
import { useState, useEffect, useRef, useContext } from "react";
import { useSession, signOut } from "next-auth/react";
import CartContext from "../_components/CartComponent";

const CustomerNav: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false); // For mobile Shop submenu
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { cart } = useContext(CartContext);
  const totalItems = cart.items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleUserMenu = () => setUserMenuOpen(!userMenuOpen);
  const toggleShopDropdown = () => setShopDropdownOpen(!shopDropdownOpen);

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

  return (
    <>
      {/* Top Info Bar */}
      <div className="bg-red-100 flex flex-col items-center py-1 text-black text-sm font-light font-montserrat">
        <p>Come visit us!</p>
        <p>572 Eglinton Avenue West</p>
        <p>(647)352-9188</p>
      </div>

      {/* Main Navbar */}
      <div className="navbar sticky top-0 z-50 bg-black">
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
          <div className="hidden sm:flex w-full justify-end text-white font-montserrat">
            <Nav className="space-x-4" direction="row" lightmode={false}>
              {/* Shop with Dropdown */}
              <div className="relative group">
                <NavLink
                  href="/shop"
                  className="flex items-center cursor-pointer"
                >
                  <span >Shop</span>
                </NavLink>
                {/* Dropdown Menu */}

                <div className="absolute left-0 mt-2 w-40 bg-white text-black  shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <Link
                    href="/shop/arrangements"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Bouquets
                  </Link>
                  <Link
                    href="/shop/vases"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    In a vase
                  </Link>

                  <Link
                    href="/shop/plants"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Plants
                  </Link>

                  <Link
                    href="/shop/products"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Products
                  </Link>
                </div>
              </div>

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
              <div className="relative flex items-center">
                <ShoppingBag color="white" />
                {totalItems > 0 && (
                  <span className="ml-1 text-sm font-semibold text-white">
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

        <NavLink className="text-white" href="/shop" onClick={toggleMenu}>
          Shop
        </NavLink>

        {/* Collapsible Shop Submenu */}
        <div className="w-full ">
          <button
            onClick={toggleShopDropdown}
            className="flex items-center justify-between w-full text-white px-4 py-2 text-left focus:outline-none"
            aria-expanded={shopDropdownOpen}
            aria-controls="shop-submenu"
          >
            {shopDropdownOpen ? (
              <ChevronUp className="w-4 h-4 mx-auto" />
            ) : (
              <ChevronDown className="w-4 h-4 mx-auto" />
            )}
          </button>
          {shopDropdownOpen && (
            <div id="shop-submenu" className="pl-4">
              <NavLink
                className="text-white block px-4 py-2"
                href="/shop/arrangements"
                onClick={toggleMenu}
              >
                Bouquets
              </NavLink>
              <NavLink
                className="text-white block px-4 py-2"
                href="/shop/vases"
                onClick={toggleMenu}
              >
                Vase Arrangements
              </NavLink>
              <NavLink
                className="text-white block px-4 py-2"
                href="/shop/plants"
                onClick={toggleMenu}
              >
                Plants
              </NavLink>

              <NavLink
                className="text-white block px-4 py-2"
                href="/shop/products"
                onClick={toggleMenu}
              >
                Products
              </NavLink>
            </div>
          )}
        </div>

        <NavLink className="text-white" href="/services" onClick={toggleMenu}>
          Services
        </NavLink>
        <NavLink className="text-white" href="/about" onClick={toggleMenu}>
          About
        </NavLink>
        <hr className="my-2 border-gray-700" />
        {user && (
          <>
            <NavLink className="text-white" href="/orders" onClick={toggleMenu}>
              View Orders
            </NavLink>
            <button
              onClick={() => {
                signOut({ callbackUrl: "/" });
                toggleMenu();
              }}
              className="text-left px-4 py-2 text-sm hover:bg-gray-700 w-full"
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
