'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '@local/validators';
import { Loader2, ScrollText } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type * as z from 'zod';

import { ModalInput } from '@/components/forms/recurringModal';
import useHandleAddDate from '@/components/hooks/useHandleAddDate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/buttons';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
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
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import submitReservation from '@/functions/reservations/createReservation';
import { categoryOptions } from '@/lib/formOptions';

type formValues = z.infer<typeof formSchema>;

const locations = [
  { label: 'Administration Board Room', value: '1' },
  { label: 'Graff Classroom', value: '2' },
  { label: 'Graff Field', value: '3' },
  { label: 'Graff Gym', value: '4 ' },
  { label: 'Graff Cafeteria', value: '5' },
  { label: 'Graff Library', value: '6' },
  { label: 'LHS Auditorium', value: '7' },
  { label: 'LHS Band Room', value: '8' },
  { label: 'LHS Choir Room', value: '9' },
  { label: 'LHS Classroom-FACS', value: '10' },
  { label: 'LHS Classroom', value: '11' },
  { label: 'LHS Depot', value: '12' },
  { label: 'LHS Gym', value: '13' },
  { label: 'LHS Library', value: '14' },
  { label: 'LHS Parking Lot', value: '15' },
  { label: 'LHS Practice Field', value: '16' },
  { label: 'LMS Band Room', value: '17' },
  { label: 'LMS Classroom FACS', value: '18' },
  { label: 'LMS Classroom', value: '19' },
  { label: 'LMS Commons', value: '20' },
  { label: 'LMS Gym', value: '21' },
  { label: 'LMS Library', value: '22' },
  { label: 'LMS Mogan Field', value: '23' },
  { label: 'South Elementary Cafeteria', value: '24' },
  { label: 'South Elementary Baseball Field', value: '25' },
  { label: 'South Elementary Classroom', value: '26' },
  { label: 'Laurel Stadium', value: '27' },
  { label: 'Laurel Stadium Warming Rooms', value: '28' },
  { label: 'West Elementary Baseball Field', value: '29' },
  { label: 'West Elementary Classroom', value: '30' },
  { label: 'West Elementary Gym', value: '31' },
];

export default function ReservationForm(props: {
  userId: string;
  email: string;
}) {
  const [isVisible, setIsVisible] = React.useState(false);
  // const [selectedData, setSelectedData] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [isRequestPending, startRequestTransition] = React.useTransition();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const hideModal = () => setIsVisible(false);

  let selectedFacility = '0';
  const router = useRouter();

  const searchParams = useSearchParams();
  if (searchParams.has('id')) {
    selectedFacility = searchParams.get('id')!;
  }
  const form = useForm<formValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: props.email,
      userId: props.userId,
      facility: selectedFacility,
      techSupport: false,
      doorAccess: false,
      category: '',
      techDetails: '',
      doorsDetails: '',
    },
  });
  const control = form.control;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'events',
    rules: { required: true },
  });
  const handleAddDate = useHandleAddDate(append);
  const watchTechSupport = form.watch('techSupport', false);
  const watchDoorAccess = form.watch('doorAccess', false);

  const onSubmit = (data: formValues) => {
    startRequestTransition(() => {
      toast.promise(submitReservation(data), {
        position: 'top-center',
        loading: 'Submitting...',
        success: () => {
          setOpen(true);
          return 'Request Submitted!';
        },
        error: (_error) => {
          return 'something went wrong';
        },
      });
    });
  };
  return (
    <div className="flex w-screen flex-col justify-center drop-shadow-md sm:w-[850px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mb-10 mt-10 space-y-8 p-2 sm:w-[800px] sm:p-0"
        >
          <div>
            <FormField
              control={form.control}
              name={'eventName'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Event Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className=""
                      placeholder="Event Name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the name of your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-col justify-between gap-y-2 sm:flex-row">
            <FormField
              control={form.control}
              name={'name'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">
                    Primary Contact Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className=""
                      placeholder="FirstName LastName"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'phone'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className=""
                      placeholder="555-555-5555"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'email'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Email</FormLabel>
                  <FormControl>
                    <Input type="text" className="" {...field} />
                  </FormControl>
                  <FormDescription>
                    Must be the email address associated with your account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name={'details'}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Event Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please provide any additional details about your event including any special requests or needs, additional contact information, etc."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Must be the email address associated with your account
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col justify-center p-2">
            <h2 className="text-center text-xl font-bold">Event Dates</h2>
            <div className="flex justify-center">
              <Button
                className="h-8 hover:cursor-pointer"
                size={'sm'}
                variant="outline"
                type="button"
                onClick={() =>
                  append({
                    startDate: '',
                    startTime: '',
                    endTime: '',
                  })
                }
              >
                Add Date
              </Button>
              <ModalInput onSave={handleAddDate} />
              <Button
                className="h-8 hover:cursor-pointer"
                variant="outline"
                size={'sm'}
                type="button"
                onClick={() => remove()}
              >
                Clear All
              </Button>
            </div>
            <div className="max-h-[400px] max-w-[800px] items-center justify-center gap-x-2 self-center overflow-y-scroll rounded-md border-2 align-middle">
              {fields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="flex shrink grid-rows-6 flex-row flex-wrap justify-start gap-2 gap-x-4 border-b-2 p-2 sm:flex-nowrap sm:justify-between"
                  >
                    <FormField
                      control={form.control}
                      name={`events.${index}.startDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Start Date</FormLabel>
                          <FormControl>
                            <Input
                              className="h-auto w-auto"
                              type="date"
                              placeholder="Start Date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`events.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Start Time</FormLabel>
                          <FormControl>
                            <Input
                              className="h-auto w-auto"
                              type="time"
                              placeholder="Start Time"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`events.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">End Time</FormLabel>
                          <FormControl>
                            <Input
                              className="h-auto w-auto"
                              type="time"
                              placeholder="End Time"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="self-end sm:self-center"
                      onClick={() => remove(index)}
                    >
                      Delete Date
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col place-items-center justify-center sm:flex-row sm:justify-between">
            <div className="text-center sm:text-start">
              <FormField
                control={form.control}
                name={'facility'}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-center text-lg sm:text-start">
                      Select A Facility
                    </FormLabel>
                    <div />
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          {field.value
                            ? locations.find(
                                (location) => location.value === field.value,
                              )?.label
                            : 'Select a Facility'}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-[180px]">
                        {locations.map((location) => (
                          <SelectItem
                            key={location.value}
                            value={location.value}
                          >
                            {location.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      May only select one facility per form
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-2 w-[200px] text-center sm:text-start">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Pricing Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <p className="flex">
                            Category Descriptions{' '}
                            <ScrollText
                              className="animate-pulse cursor-pointer hover:stroke-blue-500"
                              size={16}
                              strokeWidth={1.5}
                            />{' '}
                          </p>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Pricing Category Descriptions
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              <h1 className="my-1 text-lg font-bold">
                                Category 1
                              </h1>
                              Groups in this category are basically community
                              groups (church or secular) whose memberships
                              involve Laurel school age children whose leaders
                              or advisors are generally non-paid adults and
                              whose main purpose is to in some way educate the
                              youngster member. These groups will not be charged
                              a rental fee for the use of the buildings except
                              the LHS auditorium, any computer labs, or the
                              Stadium.
                              <h1 className="my-1 text-lg font-bold">
                                Category 2
                              </h1>
                              This category includes all community non-profit
                              organizations (IRS numbers) and community groups
                              of people who wish to use facilities owned by the
                              school district for lectures, promotional
                              activities, political rallies, entertainment,
                              college courses, athletic groups, exercise groups,
                              dance groups, church services or other activities
                              for which public halls or commercial facilities
                              generally are rented.
                              <h1 className="my-1 text-lg font-bold">
                                Category 3
                              </h1>
                              This group shall include all for-profit
                              organizations not listed in #1 or #2 and
                              non-profit organizations from outside the
                              community.
                              <h1 className="my-1 text-lg font-bold">
                                LPS Staff
                              </h1>
                              For all LPS Staff members to reserve space for
                              school related activities, sports, and groups
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Close</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div>
              <FormField
                control={form.control}
                name={'techSupport'}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Does your event require tech support?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            {watchTechSupport && (
              <FormField
                control={form.control}
                name={'techDetails'}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide any additional details "
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <div className="flex justify-center">
            <div>
              <FormField
                control={form.control}
                name={'doorAccess'}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Does your event require unlocked doors?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div>
              {watchDoorAccess && (
                <FormField
                  control={form.control}
                  name={'doorsDetails'}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide any additional details"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
          <div className="flex justify-end self-end">
            {!isSubmitting ? (
              <Button type="submit">Submit</Button>
            ) : (
              <Button disabled>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            Your request has been submitted and is now pending approval.
          </AlertDialogDescription>
          <AlertDialogFooter>
            Submit another request?
            <AlertDialogCancel onClick={() => router.push('/')}>
              No
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => location.reload()}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
