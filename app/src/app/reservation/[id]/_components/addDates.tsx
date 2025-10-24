import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddDates } from '@/lib/actions/reservations';
import { logger } from '@/lib/logger';

// form action to add dates to reservation

const AddDateDialog = ({ id }: { id: string }) => {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    new Date(2025, 9, 10),
  );
  const [startTime, setStartTime] = React.useState('10:30:00');
  const [endTime, setEndTime] = React.useState('11:30:00');
  const handleSetStartTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
  };
  const handleSetEndTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      // date + startTime string "2023-10-10 10:30:00"
      const localStart = `${date?.getFullYear()}-${date?.getMonth() + 1}-${date?.getDate()} ${startTime}`;
      logger.debug('adding date', { localStart: localStart });
      const localEnd = `${date?.getFullYear()}-${date?.getMonth() + 1}-${date?.getDate()} ${endTime}`;
      await AddDates({
        reservationID: id,
        localStart,
        localEnd,
      });
      setOpen(false);
      toast.success('Dates added successfully');
    } catch (error) {
      if (error instanceof Error) {
        logger.error(error.message);
      }
      toast.error('Something went wrong');
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} variant='outline'>
        Add Date
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Date</DialogTitle>
        </DialogHeader>
        <DialogDescription>Add a date to this reservation.</DialogDescription>
        <div className='flex flex-col space-y-4'>
          <div className='flex flex-col space-y-2'>
            <Label htmlFor='startDate'>Start Date</Label>
            <Calendar
              mode='single'
              selected={date}
              onSelect={setDate}
              className='bg-transparent p-0 [--cell-size:--spacing(10.5)]'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <Label htmlFor='startTime'>Start Time</Label>
            <Input
              id='startTime'
              type='time'
              step='1'
              defaultValue='10.30:00'
              onChange={handleSetStartTime}
              className='appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
            />
          </div>
          <div className='flex flex-col space-y-2'>
            <Label htmlFor='endTime'>End Time</Label>
            <Input
              id='endTime'
              type='time'
              step='1'
              defaultValue='11.30:00'
              onChange={handleSetEndTime}
              className='appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDateDialog;
