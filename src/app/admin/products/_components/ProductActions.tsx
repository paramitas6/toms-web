// src/app/admin/products/_components/ProductActions.tsx

"use client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import { deleteProduct, toggleProductAvailability, addFeaturedProduct, removeFeaturedProduct } from "../../_actions/products";
import { useRouter } from "next/navigation";

export function ActiveToggleDropdownItem({ id, isAvailableForPurchase }: { id: string, isAvailableForPurchase: boolean }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    return (
        <DropdownMenuItem
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    await toggleProductAvailability(id, !isAvailableForPurchase)
                    router.refresh()
                })
            }}
        >
            {isAvailableForPurchase ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
    )
}

export function DeleteDropdownItem({ id, disabled }: { id: string, disabled: boolean }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    return (
        <DropdownMenuItem
            variant="destructive"
            disabled={disabled || isPending}
            onClick={() => {
                startTransition(async () => {
                    await deleteProduct(id)
                    router.refresh()
                })
            }}
        >
            Delete
        </DropdownMenuItem>
    )
}

export function ToggleFeaturedDropdownItem({ id, isFeatured }: { id: string, isFeatured: boolean }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    return (
        <DropdownMenuItem
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    if (isFeatured) {
                        await removeFeaturedProduct(id)
                    } else {
                        await addFeaturedProduct(id)
                    }
                    router.refresh()
                })
            }}
        >
            {isFeatured ? "Remove from Featured" : "Add to Featured"}
        </DropdownMenuItem>
    )
}
