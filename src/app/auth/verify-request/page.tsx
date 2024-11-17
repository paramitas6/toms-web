// src/app/auth/verify-request/page.tsx

"use client";

import Link from "next/link";

const VerifyRequestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
      <p>
        We have sent you a verification email. Please check your email and click on the link to
        complete your sign in.
      </p>
      <Link href="/" className="mt-4 inline-block text-blue-500">
        Go Back to Home
      </Link>
    </div>
  );
};

export default VerifyRequestPage;
