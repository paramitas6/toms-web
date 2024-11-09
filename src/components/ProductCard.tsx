import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

type ProductCardProps = {
    id: string;
    name: string;
    priceInCents: number;
    description: string;
    imagePath: string;
};

export function ProductCard({ id, name, priceInCents, description, imagePath }: ProductCardProps) {
    return <Card className="flex flex-col overflow-hidden border-none shadow-none">
        <div className="relative w-full h-auto aspect-square group">
            <Image className="w-full h-full transform object-cover transition-all duration-200 group-hover:scale-105" src={imagePath} fill alt={name} />
        </div>
        <CardHeader>
            <div className="flex flex-col justify-between items-left mt-4 p-1 font-montserrat">
            <CardTitle className="text-center text-large font-light pb-2">{name}</CardTitle>
            <CardDescription className="text-center">{formatCurrency(priceInCents / 100)}</CardDescription>
            </div>

        </CardHeader>
        <CardContent className="flex-grow">
            {/* <p className="line-clamp-4">{description}</p> */}
        </CardContent>
        <CardFooter>
            {/* <Button asChild size="sm" className="w-full">
                <Link href={`/products/${id}`}>Purchase</Link>
            </Button> */}
        </CardFooter>
    </Card>
}

export function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden flex flex-col animate-pulse">
            <div className="w-full aspect-video bg-gray-300" />
            <CardHeader>
                <CardTitle>
                    <div className="w-3/4 h-6 rounded-full bg-gray-300" />
                </CardTitle>
                
                <CardDescription>
                   
                </CardDescription>
                <div className="w-1/2 h-4 rounded-full bg-gray-300" />
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="w-full h-4 rounded-full bg-gray-300" />
                <div className="w-full h-4 rounded-full bg-gray-300" />
                <div className="w-3/4 h-4 rounded-full bg-gray-300" />
            </CardContent>
            <CardFooter>
                {/* <Button className="w-full" disabled size="lg"></Button> */}
            </CardFooter>
        </Card>
    )
}