import { ReactNode } from "react"

export function PageHeader({ children }: { children: ReactNode }) {
    return <>
        <h1 className="text-5xl font-montserrat mx-4">{children}</h1>
    </>
}