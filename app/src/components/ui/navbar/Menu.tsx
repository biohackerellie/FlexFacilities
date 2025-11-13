'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ModeToggle } from '@/components/ui/buttons';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Session } from '@/lib/types';
import { Button } from '../button';

// import { requestCount } from "./requestCount";
interface MenuItem {
  title: string;
  href?: string;
  description?: string;
  items?: MenuItem[];
}
interface AuthItems {
  login: {
    title: string;
    href: string;
  };
  signup: {
    title: string;
    href: string;
  };
  logout: {
    title: string;
    href: string;
  };
}
interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  session: Session | null;
}

const AUTHORIZED_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Account',
    description: 'Manage your reservations & account details',
    href: `/account`,
  },
  {
    title: 'Reservation',
    href: `/reservation`,
    description: 'Reserve a space',
  },
];

const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    title: 'Admin',
    items: [
      {
        title: 'Dashboard',
        href: `/admin/dashboard`,
        description: 'View Admin Dashboard',
      },
      {
        title: 'Reservations',
        href: `/admin/reservations`,
        description: 'Manage Reservations',
      },
      {
        title: 'Requests',
        href: `/admin/requests`,
        description: 'Manage Pending Requests',
      },
      {
        title: 'Users',
        href: `/admin/users`,
        description: 'Manage Users',
      },
      {
        title: 'Facilities',
        href: `/admin/facilities`,
        description: 'Manage Facilities',
      },
    ],
  },
];

const AUTH_ITEMS: AuthItems = {
  login: {
    title: 'Login',
    href: `/login`,
  },
  signup: {
    title: 'Sign Up',
    href: `/login/register`,
  },
  logout: {
    title: 'Logout',
    href: `/api/auth/logout`,
  },
};

const MENUITEMS: MenuItem[] = [
  {
    title: 'Home',
    href: `/`,
  },
  {
    title: 'Calendar',
    href: `/calendar`,
    description: 'View calendar',
  },
  {
    title: 'Facilities',
    href: `/facilities`,
    description: 'View Facilities',
  },
];

export default function NavMenu({ logo, session }: NavbarProps) {
  const authorized = !!session;
  const admin = session?.userRole === 'ADMIN';
  const isMobile = useIsMobile();
  return (
    <section className='py-2 px-4 mb-2  border-b'>
      <React.Activity mode={!isMobile ? 'visible' : 'hidden'}>
        <nav className='justify-between flex'>
          <div className='flex items-center gap-6'>
            <a href={logo?.url ?? '/'} className='flex items-center gap-2'>
              <Image
                src={logo?.src ?? '/logo.png'}
                width={50}
                height={50}
                alt={logo?.alt ?? 'Logo'}
              />
              <span className='text-lg font-semibold tracking-tighter'>
                {logo?.title ?? 'FlexFacilities'}
              </span>
            </a>
            <NavigationMenu>
              <NavigationMenuList className='flex-wrap'>
                {MENUITEMS.map((item) => renderMenuItem(item))}
                <React.Activity mode={authorized ? 'visible' : 'hidden'}>
                  {AUTHORIZED_MENU_ITEMS.map((item) => renderMenuItem(item))}
                </React.Activity>
                <React.Activity mode={admin ? 'visible' : 'hidden'}>
                  {ADMIN_MENU_ITEMS.map((item) => renderMenuItem(item))}
                </React.Activity>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className='flex gap-2'>
            <React.Activity mode={authorized ? 'visible' : 'hidden'}>
              <Button asChild>
                <a href={AUTH_ITEMS.logout.href}>{AUTH_ITEMS.logout.title}</a>
              </Button>
            </React.Activity>
            <React.Activity mode={authorized ? 'hidden' : 'visible'}>
              <Button asChild variant='outline' size='sm'>
                <Link href={AUTH_ITEMS.login.href}>
                  {AUTH_ITEMS.login.title}
                </Link>
              </Button>
              <Button asChild variant='default' size='sm'>
                <Link href={AUTH_ITEMS.signup.href}>
                  {AUTH_ITEMS.signup.title}
                </Link>
              </Button>
            </React.Activity>
            <ModeToggle />
          </div>
        </nav>
      </React.Activity>
      <React.Activity mode={isMobile ? 'visible' : 'hidden'}>
        <div className='block'>
          <div className='flex items-center justify-between'>
            <a
              href={
                logo?.url ?? 'https://github.com/biohackerellie/FlexFacilities'
              }
              className='flex items-center gap-2'
            >
              <Image
                src={logo?.src ?? '/logo.png'}
                width={50}
                height={50}
                alt={logo?.alt ?? 'Logo'}
              />
            </a>
            <div className='flex items-center gap-2'>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <Menu className='size-4' />
                  </Button>
                </SheetTrigger>
                <SheetContent className='overflow-y-auto'>
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo?.url} className='flex items-center gap-2'>
                        <Image
                          src={logo?.src ?? '/logo.png'}
                          width={50}
                          height={50}
                          alt={logo?.alt ?? 'Logo'}
                        />
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className='flex flex-col gap-6 p-4'>
                    <React.Suspense fallback={<div>Loading...</div>}>
                      <Accordion
                        type='single'
                        collapsible
                        className='flex w-full flex-col gap-4'
                      >
                        {MENUITEMS.map((item) => renderMobileMenuItem(item))}
                        {authorized
                          ? AUTHORIZED_MENU_ITEMS.map((item) =>
                              renderMobileMenuItem(item),
                            )
                          : null}
                        {admin
                          ? ADMIN_MENU_ITEMS.map((item) =>
                              renderMobileMenuItem(item),
                            )
                          : null}
                      </Accordion>
                    </React.Suspense>

                    <React.Suspense fallback={<div>Loading...</div>}>
                      <div className='flex flex-col gap-3'>
                        {authorized ? (
                          <Button asChild variant='outline'>
                            <Link href={AUTH_ITEMS.logout.href}>
                              {AUTH_ITEMS.logout.title}
                            </Link>
                          </Button>
                        ) : (
                          <>
                            <Button asChild variant='outline'>
                              <Link href={AUTH_ITEMS.login.href}>
                                {AUTH_ITEMS.login.title}
                              </Link>
                            </Button>
                            <Button asChild>
                              <Link href={AUTH_ITEMS.signup.href}>
                                {AUTH_ITEMS.signup.title}
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </React.Suspense>
                  </div>
                </SheetContent>
              </Sheet>
              <ModeToggle />
            </div>
          </div>
        </div>
      </React.Activity>
    </section>
  );
}
function renderMenuItem(item: MenuItem) {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className='grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 p-2 lg:w-[600px]'>
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <Link href={subItem.href ?? '/'}>
                    <div className='text-sm leading-none font-medium'>
                      {subItem.title}
                    </div>
                    <div className='text-muted-foreground '>
                      {subItem.description}
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }
  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href={item.href ?? '/'}>{item.title}</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}
function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className='text-lg font-bold leading-none sm:text-sm sm:font-medium'>
            {title}
          </div>
          <p className='line-clamp-2 text-sm leading-snug text-muted-foreground'>
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
ListItem.displayName = 'ListItem';

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className='border-b-0'>
        <AccordionTrigger className='text-md py-0 font-semibold hover:no-underline'>
          {item.title}
        </AccordionTrigger>
        <AccordionContent className='mt-2'>
          {item.items.map((subItem) => (
            <Link
              href={subItem.href ?? '/'}
              key={subItem.title}
              className='block py-1 text-sm'
            >
              {subItem.title}
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Link
      key={item.title}
      href={item.href ?? '/'}
      className='text-md font-semibold'
    >
      {item.title}
    </Link>
  );
};
