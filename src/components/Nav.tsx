"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({
    children,
    lightmode,
    direction,
    className // Added className prop
}: {
    children: ReactNode;
    lightmode: boolean;
    direction: 'row' | 'col';
    className?: string; // Make className optional
}) {
    return (
        <nav className={`flex flex-${direction} justify-center px-4 ${lightmode ? 'text-black bg-white' : 'text-white'} ${className}`}>
            {children}
        </nav>
    );
}

export function NavLink({
    className, // Added className prop
    ...props
}: ComponentProps<typeof Link> & { className?: string }) {
    const pathname = usePathname();
    return (
        <Link
            {...props}
            className={cn(
                "hover:text-gray-100 hover:text-xl focus-visible:bg-secondary transition-all duration-100 ease-in-out flex flex-col items-center justify-center",
                pathname === props.href && "font-extrabold text-white",
                className // Add the custom className here
            )}
        />
    );
}
