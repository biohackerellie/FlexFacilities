import Link from 'next/link';

export default function Home() {
  return (
    <>
      <main className="z-0 mt-10 flex justify-center gap-10 bg-transparent p-10 text-center align-middle">
        <div className=" ">
          <h1 className="mb-10 flex justify-center border-b text-3xl font-bold text-black drop-shadow-md dark:text-gold sm:text-5xl">
            Laurel Public Schools Facility Rentals
          </h1>
          <div className="block flex-1"> </div>
          <div className="mb-10 hidden max-w-7xl justify-center align-middle sm:flex">
            <p className="mb-10 mt-4 bg-transparent p-3 text-xl text-black drop-shadow-md dark:text-white sm:text-3xl">
              Welcome! The facilities at Laurel Public Schools are available to
              the community for educational, civic, cultural, and other
              noncommercial uses consistent with the public interest, when such
              use will not interfere with the school program or school-sponsored
              activities.
            </p>
          </div>
          <div className="my-10 flex flex-col items-center justify-center gap-y-4 sm:visible sm:flex-row sm:justify-between">
            <div className="hidden h-20 w-60 animate-enter-from-left-one items-center justify-center rounded-full border border-gray-200 bg-white bg-opacity-60 bg-clip-padding text-2xl font-bold shadow-lg shadow-primary backdrop-blur-md ease-in-out hover:scale-105 dark:bg-slate-700 dark:bg-opacity-20 sm:flex">
              <Link href="/calendar" className="drop-shadow-xs">
                {' '}
                View the Calendar{' '}
              </Link>
            </div>

            <div className="flex h-20 w-60 animate-enter-from-left-two items-center justify-center rounded-full border border-gray-200 bg-white bg-opacity-60 bg-clip-padding text-2xl font-bold shadow-lg shadow-primary backdrop-blur-md ease-in-out hover:scale-105 dark:bg-slate-700 dark:bg-opacity-20">
              <Link href="/reservation" className="drop-shadow-xs">
                {' '}
                Reserve now!{' '}
              </Link>
            </div>
            <div className="flex h-20 w-60 animate-enter-from-left-three items-center justify-center rounded-full border border-gray-200 bg-white bg-opacity-60 bg-clip-padding text-2xl font-bold shadow-lg shadow-primary backdrop-blur-md ease-in-out hover:scale-105 dark:bg-slate-700 dark:bg-opacity-20">
              <Link href="/facilities" className="drop-shadow-xs">
                {' '}
                View our Facilities{' '}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
