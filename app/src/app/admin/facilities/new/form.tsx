'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Spinner } from '@/components/spinner';
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
import type {
  getAllBuildingNames,
  getAllProducts,
} from '@/lib/actions/facilities';
import { getErrorMessage } from '@/lib/errors';
import { createFacility } from './actions';

const inputStyle =
  ' mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-xs placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none  disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 ';

const schema = z.object({
  name: z.string().min(1, { message: 'Facility name is required' }),
  capacity: z.string().min(1, { message: 'Capacity is required' }),
  googleCalendarId: z
    .string()
    .min(1, { message: 'Google Calendar ID is required' }),
  buildingId: z.string().min(1, { message: 'Building is required' }),
  productId: z.string().min(1, { message: 'Product is required' }),
});
export type CreateFacilitySchema = z.infer<typeof schema>;

export default function NewFacilityForm({
  buildingPromise,
  productPromise,
}: {
  buildingPromise: Promise<Awaited<ReturnType<typeof getAllBuildingNames>>>;
  productPromise: Promise<Awaited<ReturnType<typeof getAllProducts>>>;
}) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });
  const [_submitting, startTransition] = React.useTransition();
  const buildingNames = React.use(buildingPromise);
  const prodData = React.use(productPromise);
  const products = prodData?.data;

  function onSubmit(values: z.infer<typeof schema>) {
    startTransition(() => {
      toast.promise(createFacility(values), {
        loading: 'Creating...',
        success: () => {
          form.reset();
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
                <FormLabel htmlFor='name'>Facility Name</FormLabel>
                <FormControl>
                  <Input {...field} className={inputStyle} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <React.Suspense fallback={<Spinner />}>
            <React.Activity mode={buildingNames ? 'visible' : 'hidden'}>
              <FormField
                control={form.control}
                name='buildingId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='buildingId'>Building</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value
                            ? buildingNames
                              ? buildingNames.find(
                                  (b) => b.id.toString() === field.value,
                                )?.name
                              : 'Loading names...'
                            : 'Select a building'}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {buildingNames
                          ? buildingNames.map((building) => (
                              <SelectItem
                                key={building.id}
                                value={building.id.toString()}
                              >
                                {building.name}
                              </SelectItem>
                            ))
                          : 'Loading names...'}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </React.Activity>
          </React.Suspense>
          <FormField
            control={form.control}
            name='capacity'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='capacity'>Capacity</FormLabel>
                <FormControl>
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
          <React.Suspense fallback={<Spinner />}>
            <React.Activity mode={products ? 'visible' : 'hidden'}>
              <FormField
                control={form.control}
                name='productId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='productId'>Stripe Pricing</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value
                            ? products?.find((p) => p.productId === field.value)
                                ?.productName
                            : 'Select a product'}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((p) => {
                          const prices = p.pricing
                            .map((pr) => {
                              return pr.price;
                            })
                            .sort((a, b) => a - b)
                            .map((p) => {
                              return `$${p}`;
                            });

                          return (
                            <SelectItem
                              key={p.productId}
                              value={p.productId}
                              className='text-xs truncate overflow-ellipsis'
                            >
                              {p.productName}{' '}
                              {prices.length > 0 ? `${prices.join(', ')}` : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </React.Activity>
          </React.Suspense>
          <FormField
            control={form.control}
            name='googleCalendarId'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='googlecalid'>Google Calendar ID</FormLabel>
                <FormControl>
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
