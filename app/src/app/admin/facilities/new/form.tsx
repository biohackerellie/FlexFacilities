'use client';

import { CreateFacilitySchema } from '@local/db/schema';
import { buildingNames } from '@local/validators/constants';
import { toast } from 'sonner';

import { Button } from '@/components/ui/buttons';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '@/trpc/react';

const inputStyle =
  ' mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-xs placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none  disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 ';

const initialState = {
  message: null,
};

export default function NewFacilityForm() {
  const form = useForm({
    schema: CreateFacilitySchema,
  });

  const utils = api.useUtils();
  const createFacility = api.facility.new.useMutation({
    onSuccess: async () => {
      form.reset();
      await utils.facility.invalidate();
    },
    onError: (err) => {
      toast.error(
        err.data?.code === 'UNAUTHORIZED'
          ? 'You are not authorized to create a facility'
          : 'Error creating facility',
      );
    },
  });
  return (
    <div className="flex flex-col justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => {
            createFacility.mutate(data);
          })}
        >
          <FormField
            control={form.control}
            name="name"
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
            name="building"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buildingNames.map((building, index) => (
                      <SelectItem key={index} value={building}>
                        {building}
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
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} className={inputStyle} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor="capacity">Capacity</FormLabel>
                  <Input
                    {...field}
                    name="capacity"
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
            name="category1"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor="category1">
                    Category 1 Price per hour
                  </FormLabel>
                  <Input
                    {...field}
                    name="category1"
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
            name="category2"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor="category2">
                    Category 2 Price per hour
                  </FormLabel>
                  <Input
                    {...field}
                    name="category2"
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
            name="category3"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor="category3">
                    Category 3 Price per hour
                  </FormLabel>
                  <Input
                    {...field}
                    name="category3"
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
            name="googleCalendarId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FormLabel htmlFor="googlecalid">
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
          <Button type="submit" variant="outline">
            Create
          </Button>
        </form>
      </Form>
    </div>
  );
}
