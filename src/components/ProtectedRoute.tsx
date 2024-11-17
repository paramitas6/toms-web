// src/components/ProtectedRoute.tsx

"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/login"); // Redirect if not authenticated
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading...</div>; // You can replace this with a spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
