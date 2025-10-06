'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Spinner } from '@/components/spinner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { getErrorMessage } from '@/lib/errors';
import { Email2FA } from '../actions';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

export function InputOTPForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const token = searchParams.get('token');
  if (!token) {
    return notFound();
  }
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setPending(true);
    toast.promise(Email2FA(token!, data.pin), {
      loading: 'submitting...',
      error: (err) => {
        setPending(false);
        return getErrorMessage(err);
      },
      success: () => {
        setPending(false);
        router.push('/login');
        return 'Success';
      },
      position: 'top-center',
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>One-Time Password</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>Please enter the one-time code.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={pending}>
          {pending ? (
            <span>
              <Spinner /> submitting...
            </span>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  );
}
