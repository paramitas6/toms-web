// src/app/login/page.tsx

"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage: React.FC = () => {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      setMessage("You are already logged in.");
      setTimeout(() => {
        router.push("/");
      }, 2000); // Redirect after 2 seconds
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // Check if the user exists in the database
    const checkUserRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const checkUserData = await checkUserRes.json();

    if (!checkUserData.exists) {
      // Redirect to signup page if user does not exist
      router.push("/signup");
      return;
    }

    // If user exists, proceed with the login process
    const res = await signIn("email", {
      redirect: false,
      email,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/auth/verify-request");
    }
  };

  return (
    <div className="container mx-auto p-4 text-center font-montserrat">
      <h1 className="text-5xl font-gotham tracking-wider m-10">Sign In</h1>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}
      {!session && (
        <form onSubmit={handleSubmit} className="space-y-4 mx-auto w-1/4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border-b"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-700 text-white rounded">
            Sign in with Email
          </button>
        </form>
      )}
      <p className="mt-4">
        Don’t have an account?{" "}
        <Link href="/signup" className="text-blue-500">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
 