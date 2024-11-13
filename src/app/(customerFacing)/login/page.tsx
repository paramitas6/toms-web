// src/app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast"; // Assuming you have a useToast hook similar to the reference
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const { toast } = useToast(); // Initialize the toast
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Start loading

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include", // Ensure cookies are sent
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        toast({
          variant: "destructive",
          description: data.error || "Something went wrong.",
        });
        setIsLoading(false); // Stop loading on error
        return;
      }

      toast({
        variant: "success",
        description: "Logged in successfully!",
      });
      window.location.href="/user"
      
 

      // Refresh user context or fetch user data
      // Optionally, you can trigger a global state update here

      // Redirect to user page after a short delay to allow the toast to display

    } catch (err) {
      setError("An unexpected error occurred.");
      toast({
        variant: "destructive",
        description: "An unexpected error occurred.",
      });
      console.error(err);
    } finally {
      setIsLoading(false); // Ensure loading is stopped in all cases
      
      router.push("/user")
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md text-center">
      <h1 className="text-5xl font-gotham tracking-wider my-10">Login</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 mb-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className={`w-full bg-gray-700 text-white font-montserrat p-2 rounded ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
          }`}
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? "Logging in..." : "Login"} {/* Show loading text */}
        </button>
      </form>
      <Link
        href="/signup"
        className="
       text-red-300
       hover:text-red-500"
      >
        {" "}
        Sign Up
      </Link>
    </div>
  );
};

export default LoginPage;
