'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type OccurrenceType,
  type RecurrencePatternType,
  type Step3Data,
  step3Schema,
} from '@/lib/form-schemas';
import { useFormStore } from '@/lib/form-store';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

const WEEKDAYS = [
  { value: 'SU', label: 'Sun' },
  { value: 'MO', label: 'Mon' },
  { value: 'TU', label: 'Tue' },
  { value: 'WE', label: 'Wed' },
  { value: 'TH', label: 'Thu' },
  { value: 'FR', label: 'Fri' },
  { value: 'SA', label: 'Sat' },
] as const;

export function Step3({ onNext, onBack }: Step3Props) {
  const { formData, updateFormData } = useFormStore();
  const [recurrenceType, setRecurrenceType] = useState<string>(
    formData.pattern?.freq || 'none',
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    formData.pattern?.byWeekday || [],
  );
  const [occurrences, setOccurrences] = useState<OccurrenceType[]>(
    formData.occurrences || [],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      startDate: formData.startDate,
      startTime: formData.startTime,
      endDate: formData.endDate,
      endTime: formData.endTime,
      pattern: formData.pattern,
      occurrences: formData.occurrences,
    },
  });

  const startDate = watch('startDate');
  const startTime = watch('startTime');
  const endDate = watch('endDate');
  const endTime = watch('endTime');

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const addOccurrence = () => {
    if (startDate && startTime && endDate && endTime) {
      const start = `${startDate}T${startTime}:00.000Z`;
      const end = `${endDate}T${endTime}:00.000Z`;
      const newOccurrence: OccurrenceType = { start, end };
      setOccurrences([...occurrences, newOccurrence]);

      // Clear the date/time fields
      setValue('startDate', undefined);
      setValue('startTime', undefined);
      setValue('endDate', undefined);
      setValue('endTime', undefined);
    }
  };

  const removeOccurrence = (index: number) => {
    setOccurrences(occurrences.filter((_, i) => i !== index));
  };

  const onSubmit = (data: Step3Data) => {
    const finalData: Step3Data = { ...data };

    if (recurrenceType === 'none') {
      // No recurrence pattern, create occurrence from dates
      if (startDate && startTime && endDate && endTime) {
        const start = `${startDate}T${startTime}`;
        const end = `${endDate}T${endTime}`;
        finalData.occurrences = [...occurrences, { start, end }];
        finalData.pattern = undefined;
      } else {
        finalData.occurrences = occurrences;
      }
    } else {
      // Has recurrence pattern
      const pattern: RecurrencePatternType = {
        freq: recurrenceType as 'DAILY' | 'WEEKLY' | 'MONTHLY',
        byWeekday:
          recurrenceType === 'DAILY' && selectedDays.length > 0
            ? (selectedDays as any)
            : undefined,
      };
      finalData.pattern = pattern;
      finalData.occurrences = undefined;
    }

    updateFormData(finalData);
    onNext();
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Date & Time</Label>
          <div className="grid gap-4 rounded-lg border p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-normal">
                  Start Date
                </Label>
                <Input id="startDate" type="date" {...register('startDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-normal">
                  Start Time
                </Label>
                <Input id="startTime" type="time" {...register('startTime')} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-normal">
                  End Date
                </Label>
                <Input id="endDate" type="date" {...register('endDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-sm font-normal">
                  End Time
                </Label>
                <Input id="endTime" type="time" {...register('endTime')} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recurrence">Recurrence</Label>
          <Select value={recurrenceType} onValueChange={setRecurrenceType}>
            <SelectTrigger>
              <SelectValue placeholder="Does not repeat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Does not repeat</SelectItem>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence>
          {recurrenceType === 'DAILY' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label>Repeat on</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <Label
                      htmlFor={day.value}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {recurrenceType === 'none' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Individual Occurrences</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOccurrence}
                disabled={!startDate || !startTime || !endDate || !endTime}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Occurrence
              </Button>
            </div>

            {occurrences.length > 0 && (
              <div className="space-y-2">
                {occurrences.map((occurrence, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(occurrence.start).toLocaleString()} →{' '}
                        {new Date(occurrence.end).toLocaleString()}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOccurrence(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" size="lg" className="min-w-32">
          Next
        </Button>
      </div>
    </motion.form>
  );
}
