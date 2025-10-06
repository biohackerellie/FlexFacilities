'use client';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getErrorMessage } from '@/lib/errors';
import { RequestPasswordReset } from '../actions';

export default function ResetPassword() {
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const onSubmit = () => {
    setLoading(true);
    toast.promise(RequestPasswordReset(email), {
      loading: 'submitting...',
      error: (err) => {
        setLoading(false);
        return getErrorMessage(err);
      },
      success: () => {
        setLoading(false);
        return 'Success';
      },
      position: 'top-center',
    });
  };
  return (
    <Card className="flex w-full max-w-3xl flex-col items-center justify-center p-2 text-center align-middle">
      <CardContent>
        <form className="space-y-8">
          <h1 className="text-4xl font-bold">Password Reset</h1>

          <Input
            type="email"
            name="email"
            id="email"
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="block rounded-md border-slate-300 py-2 pl-9 shadow-xs placeholder:italic placeholder:text-slate-400 focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
          />
          <div>
            <p>
              If your email is registered with us, you will receive a password
              reset link.
            </p>
          </div>
          <Button type="submit" onClick={() => onSubmit()} disabled={loading}>
            {loading ? 'Loading...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
