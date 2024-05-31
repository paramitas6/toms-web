"use client"

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

export function Nav({children,lightmode}:{children:ReactNode,lightmode:boolean}){
    return(
    <nav className={`bg-black  flex justify-center px-4 ${lightmode ? 'text-black bg-white' : 'text-white'}`}>{children}</nav>
    )
}

export function NavLink(props:Omit<ComponentProps<typeof Link>,"className">){
    const pathname = usePathname()
    return <Link {...props} className={cn("p-4 hover:bg-secondary hover:text-secondary-foreground focus-visible:bg-secondary", pathname===props.href && "font-extrabold text-white")}/>
}