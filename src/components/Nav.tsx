"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({children,lightmode, direction}:{children:ReactNode,lightmode:boolean, direction: 'row' | 'col'}){
    return(
    <nav className={`flex flex-${direction} justify-center px-4 ${lightmode ? 'text-black bg-white' : 'text-white'}`}>{children}</nav>
    )
}

export function NavLink(props:Omit<ComponentProps<typeof Link>,"className">){
    const pathname = usePathname()
    return <Link {...props} className={cn("p-4 hover:text-gray-100 hover:text-3xl focus-visible:bg-secondary transition-all duration-100 ease-in-out", pathname===props.href && "font-extrabold text-white")}/>
}
