'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-gray-50 to-gray-100 px-4 text-center dark:from-gray-900 dark:to-gray-800'>
      <div className='animate-fade-in-down'>
        <h1 className='mb-4 text-6xl font-extrabold text-gray-900 dark:text-gray-100'>
          404
        </h1>
        <p className='mb-6 text-2xl font-semibold text-gray-700 dark:text-gray-300'>
          Oops! Page not found
        </p>
      </div>
      <div className='mb-8 animate-scale-in'>
        <svg
          className='h-64 w-64 text-gray-400 dark:text-gray-600'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            className='animate-draw'
            d='M14.9577 5.6055C15.1432 5.67779 15.2918 5.82563 15.3721 6.01055C15.4524 6.19547 15.4591 6.40454 15.3909 6.59441L11.1409 18.5944C11.0686 18.7799 10.9208 18.9285 10.7358 19.0088C10.5509 19.0891 10.3419 19.0958 10.152 19.0276C9.96207 18.9593 9.81347 18.8155 9.73237 18.6345C9.65127 18.4535 9.64379 18.2484 9.71094 18.0625L13.9609 6.0625C14.0332 5.87703 14.181 5.72838 14.366 5.64808C14.5509 5.56779 14.7599 5.56107 14.9498 5.62925L14.9577 5.6055Z'
            fill='currentColor'
          />
          <path
            className='animate-fade-in'
            d='M9.01172 7.98441C9.01172 8.64025 8.73698 9.26939 8.24781 9.73441C7.75865 10.1994 7.09865 10.4613 6.41172 10.4613C5.72479 10.4613 5.06479 10.1994 4.57562 9.73441C4.08646 9.26939 3.81172 8.64025 3.81172 7.98441C3.81172 7.32857 4.08646 6.69942 4.57562 6.23441C5.06479 5.76939 5.72479 5.50753 6.41172 5.50753C7.09865 5.50753 7.75865 5.76939 8.24781 6.23441C8.73698 6.69942 9.01172 7.32857 9.01172 7.98441Z'
            fill='currentColor'
          />
          <path
            className='animate-fade-in'
            d='M20.1875 7.98441C20.1875 8.64025 19.9128 9.26939 19.4236 9.73441C18.9344 10.1994 18.2744 10.4613 17.5875 10.4613C16.9006 10.4613 16.2406 10.1994 15.7514 9.73441C15.2622 9.26939 14.9875 8.64025 14.9875 7.98441C14.9875 7.32857 15.2622 6.69942 15.7514 6.23441C16.2406 5.76939 16.9006 5.50753 17.5875 5.50753C18.2744 5.50753 18.9344 5.76939 19.4236 6.23441C19.9128 6.69942 20.1875 7.32857 20.1875 7.98441Z'
            fill='currentColor'
          />
          <path
            className='animate-draw'
            d='M12 21.5C16.9706 21.5 21 17.4706 21 12.5C21 7.52944 16.9706 3.5 12 3.5C7.02944 3.5 3 7.52944 3 12.5C3 17.4706 7.02944 21.5 12 21.5Z'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </div>
      <div className='animate-fade-in'>
        <Button onClick={() => router.back()}>Go back</Button>
      </div>
    </div>
  );
}
