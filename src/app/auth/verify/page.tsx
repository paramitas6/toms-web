// src/app/auth/verify/page.tsx

"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const VerifyPage: React.FC = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus('success');
          // Optionally, redirect to dashboard or login
          router.push('/dashboard');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [router]);

  return (
    <div className="container mx-auto p-4">
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && <p>Your email has been verified successfully!</p>}
      {status === 'error' && (
        <div>
          <p>Verification failed. Please try again or contact support.</p>
          <Link href="/auth/request-verification" className="text-blue-500">
            Request a new verification email
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyPage;
