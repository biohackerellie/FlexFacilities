'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { notFound } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import type { getAllBuildingNames } from '@/lib/actions/facilities';
import { getErrorMessage } from '@/lib/errors';
import { createFacility } from './actions';

const inputStyle =
  ' mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-xs placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none  disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 ';

const categoryPrice = z
  .string()
  .regex(/^(0|[1-9]\d*)\.\d{2}$/, {
    message: 'Must be a number with exactly 2 decimal places',
  })
  .refine((val) => parseFloat(val) >= 0, {
    message: 'Amount must be zero or positive',
  });
const schema = z.object({
  name: z.string().min(1, { message: 'Facility name is required' }),
  capacity: z.string().min(1, { message: 'Capacity is required' }),
  googleCalendarId: z
    .string()
    .min(1, { message: 'Google Calendar ID is required' }),
  buildingId: z.string().min(1, { message: 'Building is required' }),
  category1: categoryPrice,
  category2: categoryPrice,
  category3: categoryPrice,
});
export type CreateFacilitySchema = z.infer<typeof schema>;

export default function NewFacilityForm({
  buildingPromise,
}: {
  buildingPromise: Promise<Awaited<ReturnType<typeof getAllBuildingNames>>>;
}) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const [_submitting, startTransition] = React.useTransition();
  const buildingNames = React.use(buildingPromise);
  if (!buildingNames) return notFound();
  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(() => {
      toast.promise(createFacility(values), {
        loading: 'Creating...',
        success: () => {
          form.reset;
          return 'Facility created!';
        },
        error: (error) => {
          return getErrorMessage(error);
        },
      });
    });
  }
  return (
    <div className='flex flex-col justify-center'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            onSubmit(data);
          })}
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} className={inputStyle} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='buildingId'
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      {field.value
                        ? buildingNames.find(
                            (b) => b.id.toString() === field.value,
                          )?.name
                        : 'Select a building'}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buildingNames.map((building) => (
                      <SelectItem
                        key={building.id}
                        value={building.id.toString()}
                      >
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='capacity'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor='capacity'>Capacity</FormLabel>
                  <Input
                    {...field}
                    name='capacity'
                    value={field.value || 0}
                    className={inputStyle}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='category1'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor='category1'>
                    Category 1 Price per hour
                  </FormLabel>
                  <Input
                    {...field}
                    name='category1'
                    value={field.value}
                    className={inputStyle}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='category2'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor='category2'>
                    Category 2 Price per hour
                  </FormLabel>
                  <Input
                    {...field}
                    name='category2'
                    value={field.value || 0}
                    className={inputStyle}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='category3'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor='category3'>
                    Category 3 Price per hour
                  </FormLabel>
                  <Input
                    {...field}
                    name='category3'
                    value={field.value || 0}
                    className={inputStyle}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='googleCalendarId'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor='googlecalid'>
                    Google Calendar ID
                  </FormLabel>
                  <Input
                    {...field}
                    className={inputStyle}
                    value={field.value || ''}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='submit' variant='outline'>
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
}
