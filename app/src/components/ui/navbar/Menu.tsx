"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

import { IssuesForm } from "@/components/forms";
import { Button, ModeToggle, RequestBadge } from "@/components/ui/buttons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuMobileTrigger,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

// import { requestCount } from "./requestCount";

export function AuthenticatedMenu() {
  const { data: session, status } = useSession();
  console.log("session: ", session);
  let admin = false;
  if (session && session.user.role.includes("ADMIN")) {
    admin = true;
  }
  if (status === "loading") {
    return (
      <NavigationMenuItem>
        <Button disabled>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Please Wait
        </Button>
      </NavigationMenuItem>
    );
  }
  if (status === "authenticated") {
    return (
      <>
        <div className="hidden sm:flex">
          <NavigationMenuItem>
            <NavigationMenuTrigger>Account</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <Link
                  href={`${process.env.NEXT_PUBLIC_HOST}/account`}
                  prefetch={false}
                  replace={true}
                  legacyBehavior
                  passHref
                >
                  <ListItem title="My Account">
                    Manage your reservations & account details
                  </ListItem>
                </Link>
                <ListItem
                  className="cursor-pointer"
                  title="Sign Out"
                  onClick={() => signOut()}
                >
                  Sign out of your account
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {admin && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Admin</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <Link href="/admin/dashboard" legacyBehavior passHref>
                    <ListItem title="Dashboard">
                      View the admin dashboard
                    </ListItem>
                  </Link>
                  <Link href="/admin/reservations" legacyBehavior passHref>
                    <ListItem title="Reservations">
                      Manage reservations
                    </ListItem>
                  </Link>
                  <Link href="/admin/requests" legacyBehavior passHref>
                    <ListItem title="Requests">
                      Manage requests
                      {/* <RequestBadge requestCount={requestCount()} /> */}
                    </ListItem>
                  </Link>
                  <Link href="/admin/users" legacyBehavior passHref>
                    <ListItem title="Users">Manage users</ListItem>
                  </Link>
                  <Link href="/admin/facilities" legacyBehavior passHref>
                    <ListItem title="Facilities">Manage facilities</ListItem>
                  </Link>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}
        </div>
        <div className="visible sm:hidden">
          <Link href="/account" legacyBehavior passHref>
            <ListItem title="My Reservations" />
          </Link>
          <ListItem title="Sign Out" onClick={() => signOut()} />
        </div>
      </>
    );
  }
  return (
    <>
      <div className="hidden sm:flex">
        <NavigationMenuItem>
          <NavigationMenuLink
            className={`${navigationMenuTriggerStyle()}, cursor-pointer`}
            onClick={() => signIn()}
          >
            Sign In
          </NavigationMenuLink>
        </NavigationMenuItem>
      </div>
      <div className="flex sm:hidden">
        <Link href="/login" legacyBehavior passHref>
          <ListItem title="Sign In" />
        </Link>
      </div>
    </>
  );
}

export default function NavMenu() {
  return (
    <>
      <NavigationMenu>
        <div className="hidden sm:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/calendar" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Calendar
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Facilities</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <Link href="/reservation" legacyBehavior passHref>
                    <ListItem title="Reservation Form">
                      Reserve a space now
                    </ListItem>
                  </Link>
                  <Link
                    href="https://facilities.laurel.k12.mt.us/facilities"
                    legacyBehavior
                    passHref
                  >
                    <ListItem title="Find a Space">
                      View all of our available facilities
                    </ListItem>
                  </Link>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <AuthenticatedMenu />

            <ModeToggle />
          </NavigationMenuList>
        </div>
        <div className="ml-4 flex flex-1 sm:hidden">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuMobileTrigger />

              <NavigationMenuContent className=" ">
                <ul className="flex max-h-screen list-none columns-1 flex-col flex-nowrap items-start gap-4 text-lg">
                  <Link href="/" legacyBehavior passHref>
                    <ListItem title="Home" />
                  </Link>
                  <Link href="/facilities" legacyBehavior passHref>
                    <ListItem title="Facilities" />
                  </Link>
                  <AuthenticatedMenu />
                  <IssuesForm />
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </div>
      </NavigationMenu>
    </>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-lg font-bold leading-none sm:text-sm sm:font-medium">
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
