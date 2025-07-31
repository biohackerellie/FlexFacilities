import { DataTable } from "@/components/ui/tables/users/data-table";
import { api } from "@/trpc/server";
import { columns } from "./columns";

interface TableUsers {
  User: string;
  Email: string;
  Role: string;
  Details: string;
}

async function getUsers() {
  const users = await api.user.all();

  const mappedUsers: TableUsers[] = users.map((user) => {
    return {
      User: user.name,
      Email: user.email,
      Role: user.role,
      Details: user.id.toString(),
    };
  });
  return mappedUsers;
}

export default async function Users() {
  const data = await getUsers();

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-lg font-medium">Users</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
