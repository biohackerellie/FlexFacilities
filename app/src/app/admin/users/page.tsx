import { cacheTag } from 'next/cache';
import { DataTable } from '@/components/ui/tables/users/data-table';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import { columns } from './columns';

interface TableUsers {
  User: string;
  Email: string;
  Role: string;
  Details: string;
}

async function getUsers(session: string, token: string) {
  'use cache';
  const authed = client.withAuth(session, token);
  const { data, error } = await authed.users().getUsers({});

  if (error) {
    logger.error(error.message);
  }

  cacheTag('users');
  return data;
}

export default async function Users() {
  const { session, token } = await getCookies();
  if (!session || !token) {
    return null;
  }
  const data = await getUsers(session, token);
  return (
    <div className='space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>Users</h1>
      </div>
      <DataTable columns={columns} data={data?.users ?? []} />
    </div>
  );
}
