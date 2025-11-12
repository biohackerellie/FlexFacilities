'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();
  return (
    <div className='container-wrapper'>
      <div className='container'>
        <h2>Something went wrong!</h2>
        <p className='text-red-500'>{error.message}</p>
        <button onClick={() => reset()}>Try again</button>
        <button onClick={() => router.push('/')}>Home</button>
      </div>
    </div>
  );
}
