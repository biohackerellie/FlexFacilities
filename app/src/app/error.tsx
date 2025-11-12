'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  'use no memo';
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
