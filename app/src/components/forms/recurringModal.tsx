import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dayOptions } from '@/lib/formOptions';
import { Button } from '../ui/buttons';

export const ModalInput = (props: { onSave: (data: any) => void }) => {
  const { onSave } = props;
  const { register, handleSubmit, control } = useForm();
  const dialogClose = () => {
    document.getElementById('closeDialog')?.click();
  };
  const animatedComponents = makeAnimated();
  const forwardChange = (data: any) => {
    onSave(data);
    dialogClose();
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="h-8 hover:cursor-pointer"
          variant="outline"
          size={'sm'}
        >
          Add Reoccurring Dates
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col place-content-center items-center justify-center">
          <form onSubmit={handleSubmit(forwardChange)}>
            <div className="my-2 gap-2 border-b-2 p-2">
              <Label className="font-Bold">Start Date</Label>

              <Input
                className="form-date bg-gray-300 text-black hover:bg-gray-200"
                type="date"
                {...register('startDate')}
              />
            </div>
            <div className="my-2 gap-2 border-b-2 p-2">
              <Label className="label">Event start time? </Label>
              <Input
                type="time"
                className="form-date my-2 bg-gray-300 text-black hover:bg-gray-200"
                {...register('startTime')}
              />
            </div>
            <div>
              <div className="my-2 gap-2 border-b-2 p-2">
                <Label className="label">Event end time? </Label>
                <Input
                  type="time"
                  className="form-date bg-gray-300 text-black hover:bg-gray-200"
                  {...register('endTime')}
                />
              </div>
              <div className="my-2 gap-2 border-b-2 p-2">
                <Label className="label">Day of the Week</Label>
                <div className="control text-black">
                  <Controller
                    name="dayOfWeek"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        closeMenuOnSelect={false}
                        components={animatedComponents}
                        options={dayOptions}
                        className="text-black"
                        isMulti
                        required
                      />
                    )}
                  />
                </div>
              </div>
              <div className="my-2 gap-2 border-b-2 p-2">
                <Label className="label">Repeat Until</Label>
                <div className="control">
                  <Input
                    type="date"
                    className="form-date bg-gray-300 text-black hover:bg-gray-200"
                    {...register('repeatUntil')}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    className="h-10"
                    onClick={handleSubmit(forwardChange)}
                  >
                    Save
                  </Button>
                </DialogClose>
              </DialogFooter>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
