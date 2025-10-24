'use client';
import { Grid2x2 } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { type FormState, Login } from './actions';

const _initialState = { message: '', errors: undefined } as FormState;

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [pending, setPending] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  function onSubmit() {
    setPending(true);
    toast.promise(Login(email, password), {
      loading: 'submitting...',
      error: (err) => {
        setPending(false);
        return getErrorMessage(err);
      },
      success: () => {
        setPending(false);
        return 'Check your email to verify your account';
      },
      position: 'top-center',
    });
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-6'>
            <div className='flex flex-col gap-4'>
              <a
                type='submit'
                className={cn(
                  'w-full',
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                )}
                href='/api/auth/entra'
              >
                Login with Microsoft <Grid2x2 className='text-black' />
              </a>
            </div>
            <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
              <span className='bg-card text-muted-foreground relative z-10 px-2'>
                Or continue with
              </span>
            </div>
            <div className='grid gap-6'>
              <div className='grid gap-3'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  required
                  type='email'
                  name='email'
                  placeholder='Email address'
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p aria-live='polite' className='text-sm text-red-500'></p>
              </div>
              <div className='grid gap-3'>
                <div className='flex items-center'>
                  <Label htmlFor='password'>Password</Label>
                  <Link
                    className='ml-auto text-sm underline-offset-4 hover:underline'
                    href='/login/reset'
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  required
                  type='password'
                  name='password'
                  id='password'
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Password'
                />
                <p aria-live='polite' className='text-sm text-red-500'></p>
              </div>
              <Button disabled={pending} onClick={onSubmit} className='w-full'>
                Login
              </Button>
            </div>
            <div className='text-center text-sm'>
              <Button
                asChild
                variant='outline'
                className='mt-2 w-auto justify-center self-center align-middle font-light sm:font-medium'
              >
                <Link href='/login/register' className='w-2/3'>
                  Don't have an account? Register here!
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
