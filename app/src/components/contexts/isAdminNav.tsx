import { auth } from '@local/auth';
import React from 'react';

export default async function IsAdminNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    session?.user.role === 'ADMIN_ADMIN' ||
    session?.user.role === 'CAL_ADMIN' ||
    session?.user.role === 'GR_ADMIN' ||
    session?.user.role === 'LHS_ADMIN' ||
    session?.user.role === 'LMS_ADMIN' ||
    session?.user.role === 'WE_ADMIN' ||
    session?.user.role === 'SO_ADMIN' ||
    session?.user.role === 'SUP_ADMIN'
  ) {
    return <> {children} </>;
  } else {
    return null;
  }
}
