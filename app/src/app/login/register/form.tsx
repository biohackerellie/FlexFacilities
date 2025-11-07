'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/errors';
import { CreateUser } from '../actions';

interface InputState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ErrorState {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function CreateAccount() {
  const [input, setInput] = React.useState<InputState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = React.useState<ErrorState>({});
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
    validateInput(name as keyof InputState, value);
  };

  const validateInput = (name: keyof InputState, value: string) => {
    setError((prev) => {
      const next = { ...prev, [name]: '' };

      switch (name) {
        case 'name':
          if (!value) next[name] = 'Please enter your name.';
          break;
        case 'email':
          if (!value) next[name] = 'Please enter Email.';
          // naive email regex check
          else if (!/.+@.+\..+/.test(value))
            next[name] = 'Invalid email address.';
          break;
        case 'password':
          if (!value) next[name] = 'Please enter Password.';
          else if (input.confirmPassword && value !== input.confirmPassword) {
            next.confirmPassword = 'Passwords do not match.';
          }
          break;
        case 'confirmPassword':
          if (!value) next[name] = 'Please confirm Password.';
          else if (input.password && value !== input.password) {
            next[name] = 'Passwords do not match.';
          }
          break;
      }
      return next;
    });
  };
  const router = useRouter();
  const onSubmit = () => {
    if (input.password !== input.confirmPassword) {
      setError((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match.',
      }));
      return;
    }

    startTransition(() => {
      toast.promise(CreateUser(input), {
        loading: 'Creating...',
        success: () => {
          setInput({ name: '', email: '', password: '', confirmPassword: '' });
          setOpen(true);
          return 'Account created!';
        },
        error: (err) => getErrorMessage(err),
      });
    });
  };

  return (
    <Card className='flex w-full max-w-3xl flex-col items-center justify-center p-2 text-center'>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>

      <CardContent className='flex gap-4'>
        <div className='grid gap-6 w-full'>
          <div className='grid gap-3'>
            <Label htmlFor='name'>Name</Label>
            <Input
              type='text'
              id='name'
              name='name'
              value={input.name}
              required
              placeholder='First and Last name'
              onChange={onInputChange}
            />
            {error.name && <p className='text-sm text-red-500'>{error.name}</p>}
          </div>

          <div className='grid gap-3'>
            <Label htmlFor='email'>Email</Label>
            <Input
              type='email'
              id='email'
              name='email'
              value={input.email}
              required
              placeholder='Email'
              onChange={onInputChange}
            />
            {error.email && (
              <p className='text-sm text-red-500'>{error.email}</p>
            )}
          </div>

          <div className='grid gap-3'>
            <Label htmlFor='password'>Password</Label>
            <Input
              type='password'
              id='password'
              name='password'
              value={input.password}
              required
              placeholder='Password'
              onChange={onInputChange}
            />
            {error.password && (
              <p className='text-sm text-red-500'>{error.password}</p>
            )}
          </div>

          <div className='grid gap-3'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={input.confirmPassword}
              required
              placeholder='Confirm Password'
              onChange={onInputChange}
            />
            {error.confirmPassword && (
              <p className='text-sm text-red-500'>{error.confirmPassword}</p>
            )}
          </div>

          <CardFooter className='flex justify-center'>
            <Button onClick={onSubmit} disabled={pending}>
              {pending ? <Spinner /> : 'Create Account'}
            </Button>
          </CardFooter>
        </div>

        <Dialog open={open} onOpenChange={() => setOpen(!open)}>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogTitle>Account created</DialogTitle>
            <DialogDescription>
              You will need to follow the link sent to your email to log in.
            </DialogDescription>
            <DialogFooter>
              <Button onClick={() => router.push('/login')}>Ok</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
