"use client";
import {Session} from "@/lib/types"

interface Props {
  children: React.ReactNode;
  session?: Session;
}

export default function AuthProvider({ children, session }: Props) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
