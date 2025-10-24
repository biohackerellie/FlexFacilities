'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type Step4Data, step4Schema } from '@/lib/form-schemas';
import { useFormStore } from '@/lib/form-store';

interface Step4Props {
  onSubmit: () => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step4({ onSubmit, onBack, onNext }: Step4Props) {
  const { formData, updateFormData } = useFormStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      techSupport: formData.techSupport,
      techDetails: formData.techDetails,
      doorAccess: formData.doorAccess,
      doorDetails: formData.doorDetails,
    },
  });

  const techSupport = watch('techSupport');
  const doorAccess = watch('doorAccess');

  const handleFormSubmit = (data: Step4Data) => {
    updateFormData(data);
    onSubmit();
    onNext();
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(handleFormSubmit)}
      className='space-y-6'
    >
      <div className='space-y-6'>
        <div className='space-y-4 rounded-lg border p-4'>
          <div className='flex items-start space-x-3'>
            <Checkbox
              id='techSupport'
              checked={techSupport}
              onCheckedChange={(checked) =>
                setValue('techSupport', checked as boolean)
              }
            />
            <div className='space-y-1'>
              <Label
                htmlFor='techSupport'
                className='cursor-pointer font-semibold'
              >
                Technical Support
              </Label>
              <p className='text-sm text-muted-foreground'>
                Request technical support for your event (AV equipment,
                projectors, etc.)
              </p>
            </div>
          </div>

          <AnimatePresence>
            {techSupport && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='space-y-2 pl-7'
              >
                <Label htmlFor='techDetails'>Technical Requirements</Label>
                <Textarea
                  id='techDetails'
                  placeholder='Describe your technical needs...'
                  rows={3}
                  {...register('techDetails')}
                  className={errors.techDetails ? 'border-destructive' : ''}
                />
                {errors.techDetails && (
                  <p className='text-sm text-destructive'>
                    {errors.techDetails.message}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className='space-y-4 rounded-lg border p-4'>
          <div className='flex items-start space-x-3'>
            <Checkbox
              id='doorAccess'
              checked={doorAccess}
              onCheckedChange={(checked) =>
                setValue('doorAccess', checked as boolean)
              }
            />
            <div className='space-y-1'>
              <Label
                htmlFor='doorAccess'
                className='cursor-pointer font-semibold'
              >
                Door Access
              </Label>
              <p className='text-sm text-muted-foreground'>
                Request special door access or key card arrangements
              </p>
            </div>
          </div>

          <AnimatePresence>
            {doorAccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='space-y-2 pl-7'
              >
                <Label htmlFor='doorDetails'>Access Requirements</Label>
                <Textarea
                  id='doorDetails'
                  placeholder='Describe your access needs...'
                  rows={3}
                  {...register('doorDetails')}
                  className={errors.doorDetails ? 'border-destructive' : ''}
                />
                {errors.doorDetails && (
                  <p className='text-sm text-destructive'>
                    {errors.doorDetails.message}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className='flex justify-between'>
        <Button type='button' variant='outline' size='lg' onClick={onBack}>
          Back
        </Button>
        <Button type='submit' size='lg' className='min-w-32'>
          Submit
        </Button>
      </div>
    </motion.form>
  );
}
