import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { ModeToggle } from '../buttons';
import NavMenu from './Menu';

export default function Navbar() {
  return (
    <>
      <nav className="sticky top-0 z-30 flex w-full items-center justify-between bg-primary py-1 sm:px-2">
        <div className="hidden gap-10 sm:flex">
          <Link href="https://laurel.k12.mt.us" target="_blank">
            <Image
              src="/logo-white.png"
              alt="LPS Logo"
              width={50}
              height={50}
            />
          </Link>
          <h1 className="hidden text-sm font-bold text-white sm:inline-block sm:text-xl">
            Laurel Montana Facility Rentals
          </h1>
        </div>
        <div className="justify-end">
          <Suspense fallback={<Loader2 className="animate-spin h-4 w-4" />}>
            <NavMenu />
          </Suspense>
        </div>
        <div className="mr-4 flex sm:hidden">
          <ModeToggle />
        </div>
      </nav>
    </>
  );
}
