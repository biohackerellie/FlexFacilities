'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

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
      <div className='container '>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
          <h2>Something went wrong!</h2>
          <pre className='text-red-500'>
            <code>{error.message}</code>
          </pre>
          <div className='flex gap-2'>
            <Button onClick={() => reset()}>Try again</Button>
            <Button onClick={() => router.push('/')}>Home</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
