'use client';

import { EmailNotificationsType } from '@local/db/schema';
import type { ColumnDef } from '@tanstack/react-table';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/buttons';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UpdateEmailNotifications } from './actions';
import { CreateEmail, DeleteEmail, UpdateNotifications } from './actions';

const columns: ColumnDef<EmailNotificationsType>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'HsEmails',
    header: 'LHS',
    cell: ({ row }) => {
      const id = row.original.id;
      const HsEmails = row.original.HsEmails;
      const data: UpdateEmailNotifications = {
        id: id,
        HsEmails: !HsEmails,
      };
      return (
        <Checkbox
          checked={row.original.HsEmails}
          onClick={() => UpdateNotifications(data)}
        />
      );
    },
  },
  {
    accessorKey: 'MsEmails',
    header: 'LMS',
    cell: ({ row }) => {
      const id = row.original.id;
      const MsEmails = row.original.MsEmails;
      const data: UpdateEmailNotifications = {
        id: id,
        MsEmails: !MsEmails,
      };
      return (
        <Checkbox
          checked={row.original.MsEmails}
          onClick={() => UpdateNotifications(data)}
        />
      );
    },
  },
  {
    accessorKey: 'GrEmails',
    header: 'Graff',
    cell: ({ row }) => {
      const id = row.original.id;
      const GrEmails = row.original.GrEmails;
      const data: UpdateEmailNotifications = {
        id: id,
        GrEmails: !GrEmails,
      };
      return (
        <Checkbox
          checked={row.original.GrEmails}
          onClick={() => UpdateNotifications(data)}
        />
      );
    },
  },
  {
    accessorKey: 'WeEmails',
    header: 'West',
    cell: ({ row }) => {
      const id = row.original.id;
      const WeEmails = row.original.WeEmails;
      const data: UpdateEmailNotifications = {
        id: id,
        WeEmails: !WeEmails,
      };
      return (
        <Checkbox
          checked={row.original.WeEmails}
          onClick={() => UpdateNotifications(data)}
        />
      );
    },
  },
  {
    accessorKey: 'SoEmails',
    header: 'South',
    cell: ({ row }) => {
      const id = row.original.id;
      const SoEmails = row.original.SoEmails;
      const data: UpdateEmailNotifications = {
        id: id,
        SoEmails: !SoEmails,
      };
      return (
        <Checkbox
          checked={row.original.SoEmails}
          onClick={() => UpdateNotifications(data)}
        />
      );
    },
  },
  {
    accessorKey: 'StEmails',
    header: 'Stadium',
    cell: ({ row }) => {
      const id = row.original.id;
      const StEmails = row.original.StEmails;
      const data: UpdateEmailNotifications = {
        id: id,
        StEmails: !StEmails,
      };
      return (
        <Checkbox
          checked={row.original.StEmails}
          onClick={() => UpdateNotifications(data)}
        />
      );
    },
  },
  {
    accessorKey: 'id',
    header: () => {
      return <Create />;
    },
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <Button variant="ghost" size="icon" onClick={() => DeleteEmail(email)}>
          {' '}
          <TrashIcon />{' '}
        </Button>
      );
    },
  },
];

const initialState = {
  message: null,
  errors: '',
};
function Create() {
  const [state, formAction] = useActionState(CreateEmail, initialState);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <PlusIcon className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Notified User</DialogTitle>
          <DialogDescription>
            Add the email address and the schools they would like to be notified
            about
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                defaultValue=""
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="flex flex-col items-center">
                <Label htmlFor="HsEmails">LHS</Label>
                <Checkbox
                  name="HsEmails"
                  id="HsEmails"
                  value="True"
                  defaultValue="False"
                />
              </div>
              <div className="flex flex-col items-center">
                <Label htmlFor="MsEmails">LMS</Label>
                <Checkbox
                  name="MsEmails"
                  id="MsEmails"
                  value="True"
                  defaultValue="False"
                />
              </div>
              <div className="flex flex-col items-center">
                <Label htmlFor="GrEmails">Graff</Label>
                <Checkbox
                  name="GrEmails"
                  id="GrEmails"
                  value="True"
                  defaultValue="False"
                />
              </div>
              <div className="flex flex-col items-center">
                <Label htmlFor="WeEmails">West</Label>
                <Checkbox
                  name="WeEmails"
                  id="WeEmails"
                  value="True"
                  defaultValue="False"
                />
              </div>
              <div className="flex flex-col items-center">
                <Label htmlFor="SoEmails">South</Label>
                <Checkbox
                  name="SoEmails"
                  id="SoEmails"
                  value="True"
                  defaultValue="False"
                />
              </div>
              <div className="flex flex-col items-center">
                <Label htmlFor="StEmails">Stadium</Label>
                <Checkbox
                  name="StEmails"
                  id="StEmails"
                  value="True"
                  defaultValue="False"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <p aria-live="polite" className="text-red-500">
              {state?.errors}
            </p>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default columns;
