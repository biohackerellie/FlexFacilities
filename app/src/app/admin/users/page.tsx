import { DataTable } from '@/components/ui/tables/users/data-table';
import { logger } from '@/lib/logger';
import { client } from '@/lib/rpc';
import { columns } from './columns';

interface TableUsers {
  User: string;
  Email: string;
  Role: string;
  Details: string;
}

async function getUsers() {
  // TODO: cache
  const { data, error } = await client.users().getUsers({});

  if (error) {
    logger.error(error.message);
  }

  return data;
}

export default async function Users() {
  const data = await getUsers();
  return (
    <div className='space-y-7'>
      <div>
        <h1 className='text-lg font-medium'>Users</h1>
      </div>
      <DataTable columns={columns} data={data?.users ?? []} />
    </div>
  );
}
