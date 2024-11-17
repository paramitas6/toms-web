// src/app/auth/error/page.tsx

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const AuthErrorPage: React.FC = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
      <p className="mb-4">
        {error
          ? `An error occurred: ${error}`
          : "An unknown error occurred during authentication."}
      </p>
      <Link href="/login" className="text-blue-500">
        Go Back to Login
      </Link>
    </div>
  );
};

export default AuthErrorPage;
