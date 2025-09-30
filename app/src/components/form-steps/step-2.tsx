'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Step2Data, step2Schema } from '@/lib/form-schemas';
import { useFormStore } from '@/lib/form-store';

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export function Step2({ onNext, onBack }: Step2Props) {
  const { formData, updateFormData } = useFormStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      eventName: formData.eventName,
      details: formData.details,
      name: formData.name,
      phone: formData.phone,
    },
  });

  const onSubmit = (data: Step2Data) => {
    updateFormData(data);
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
          <Label htmlFor="eventName">Event Name</Label>
          <Input
            id="eventName"
            placeholder="Annual Company Meeting"
            {...register('eventName')}
            className={errors.eventName ? 'border-destructive' : ''}
          />
          {errors.eventName && (
            <p className="text-sm text-destructive">
              {errors.eventName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Event Details</Label>
          <Textarea
            id="details"
            placeholder="Describe your event..."
            rows={4}
            {...register('details')}
            className={errors.details ? 'border-destructive' : ''}
          />
          {errors.details && (
            <p className="text-sm text-destructive">{errors.details.message}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Contact Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>
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
