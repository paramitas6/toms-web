"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignupPage: React.FC = () => {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      // Redirect to shop page if the user is already signed in
      router.push("/shop");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      if (res.ok) {
        const signInResponse = await signIn("email", { redirect: false, email });
        if (signInResponse?.error) {
          setError(signInResponse.error);
        } else {
          router.push("/auth/verify-request");
        }
      } else {
        const data = await res.json();
        setError(data.message || "Signup failed");
      }
    } catch (error) {
      setError("An error occurred during signup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session) {
    return (
      <div className="text-center p-8">
        <p className="text-2xl">You are already signed in!</p>
        <Link href="/shop" className="text-blue-500 mt-4 inline-block">
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-center font-montserrat">
      <h1 className="text-5xl font-gotham tracking-wider m-10">Join Us!</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 w-1/4 mx-auto">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border-b text-center"
          />
        </div>
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
            className="w-full px-3 py-2 border-b text-center"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone:
          </label>
          <input
            type="text"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border-b text-center"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-gray-700 text-white rounded"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing up..." : "Sign up"}
        </button>
      </form>
      <p className="mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
