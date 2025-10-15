'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { addFee } from '@/lib/actions/reservations';

interface IForminput {
  additionalFees: number;
  feesType: string;
  reservationId: any;
}

export default function EditPricing({ id }: { id: string }) {
  const { register, handleSubmit } = useForm<IForminput>();
  const router = useRouter();
  const reservationID = id;
  const onSubmit = async (data: IForminput) => {
    try {
      await addFee(data, reservationID);
    } catch (error) {
      throw new Error('Something went wrong', { cause: error });
    } finally {
      router.refresh();
    }
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Add Fee</Button>
      </SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <SheetHeader>
            <SheetTitle>Add Fee</SheetTitle>
            <SheetDescription>
              Add an additional fee to this reservation.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="start-date">Fee Amount</Label>
              <input
                {...register('additionalFees')}
                id="additionalFees"
                type="number"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="feesType">Type of Fee</Label>
              <input {...register('feesType')} id="feesType" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save Changes</Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
