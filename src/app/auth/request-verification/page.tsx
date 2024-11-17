// src/app/auth/request-verification/page.tsx

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const RequestVerificationPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to the Verify Request Page upon success
        router.push('/auth/verify-request');
      } else {
        // Display the error message returned from the server
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Request Verification Email</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-3 py-2 border rounded"
            placeholder="you@example.com"
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Verification Email'}
        </button>
      </form>
      <Link href="/" className="mt-4 inline-block text-blue-500">
        Go Back to Home
      </Link>
    </div>
  );
};

export default RequestVerificationPage;
