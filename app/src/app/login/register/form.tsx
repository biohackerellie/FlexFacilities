'use client';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogContent,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/spinner';
import { CreateUser } from '../actions';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';

export default function CreateAccount() {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const onSubmit = () => {
    startTransition(() => {
      toast.promise(CreateUser({ name, email, password }), {
        loading: 'Creating...',
        success: () => {
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setOpen(true);
          return 'Account created!';
        },
        error: (error) => {
          return getErrorMessage(error);
        },
      });
    });
  };

  return (
    <Card className="flex w-full max-w-3xl flex-col items-center justify-center p-2 text-center align-middle">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <form onSubmit={() => onSubmit}>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label>Name</Label>
              <Input
                type="text"
                placeholder="First and Last name"
                id="name"
                name="name"
              />
            </div>
            <div className="grid gap-3">
              <Label>Email</Label>
              <Input type="email" id="email" name="email" placeholder="Email" />
            </div>
            <div className="grid gap-3">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Password"
                id="password"
                name="password"
              />

              <p aria-live="polite" className="text-sm text-red-500"></p>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
              />
              <p aria-live="polite" className="text-sm text-red-500"></p>
            </div>
            <CardFooter className="flex justify-center align-middle">
              <Button disabled={pending} type="submit">
                {pending ? <Spinner /> : 'Create Account'}
              </Button>
            </CardFooter>
          </div>
        </form>
        <Dialog open={open} onOpenChange={setOpen(!open)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogTitle></DialogTitle>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
