import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddDates } from '@/lib/actions/reservations';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { logger } from '@/lib/logger';

// form action to add dates to reservation

const AddDateDialog = ({ id }: { id: bigint }) => {
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
      const localStart = `${date!.getFullYear()}-${date!.getMonth() + 1}-${date!.getDate()} ${startTime}`;
      logger.debug('adding date', { localStart: localStart });
      const localEnd = `${date!.getFullYear()}-${date!.getMonth() + 1}-${date!.getDate()} ${endTime}`;
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
      <Button onClick={() => setOpen(true)} variant="outline">
        Add Date
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Date</DialogTitle>
        </DialogHeader>
        <DialogDescription>Add a date to this reservation.</DialogDescription>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="startDate">Start Date</label>
            <input name="startDate" id="startDate" type="date" />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="startTime">Start Time</label>
            <input name="startTime" id="startTime" type="time" />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="endTime">End Time</label>
            <input name="endTime" id="endTime" type="time" />
          </div>
        </div>
        <DialogFooter>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddDateDialog;
