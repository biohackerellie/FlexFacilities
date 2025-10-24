'use client';
import { AnimatePresence } from 'framer-motion';
import * as React from 'react';
import { toast } from 'sonner';
import { FormProgress } from '@/components/form-progress';
import { Step1 } from '@/components/form-steps/step-1';
import { Step2 } from '@/components/form-steps/step-2';
import { Step3 } from '@/components/form-steps/step-3';
import { Step4 } from '@/components/form-steps/step-4';
import { StepComplete } from '@/components/form-steps/step-complete';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { getFacilities } from '@/lib/actions/facilities';
import { createReservation } from '@/lib/actions/reservations';
import { getErrorMessage } from '@/lib/errors';
import { useFormStore } from '@/lib/form-store';

const FORM_STEPS = [
  {
    title: 'Select Facility',
    description: 'Choose your location',
  },
  {
    title: 'Event Details',
    description: 'Tell us about your event',
  },
  {
    title: 'Date & Time',
    description: 'Schedule your reservation',
  },
  {
    title: 'Additional Services',
    description: 'Optional support',
  },
  {
    title: 'Complete',
    description: 'Your reservation has been submitted',
  },
];

interface MultiStepFormProps {
  facilitiesPromise: Promise<Awaited<ReturnType<typeof getFacilities>>>;
  userID: string;
}

export function MultiStepForm({
  facilitiesPromise,
  userID,
}: MultiStepFormProps) {
  const { currentStep, nextStep, previousStep, resetForm, formData } =
    useFormStore();

  React.useEffect(() => {
    console.log(currentStep);
  }, [currentStep]);
  const handleComplete = () => {
    nextStep();
    toast.promise(createReservation(formData), {
      success: () => {
        return 'Submitted!';
      },
      error: (error) => getErrorMessage(error),
      loading: 'loading...',
      position: 'top-center',
    });
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <div className='mx-auto w-full max-w-3xl space-y-8'>
      {currentStep < FORM_STEPS.length && (
        <FormProgress
          currentStep={currentStep}
          totalSteps={FORM_STEPS.length}
          steps={FORM_STEPS}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            {currentStep < FORM_STEPS.length
              ? FORM_STEPS[currentStep]?.title
              : 'Complete'}
          </CardTitle>
          <CardDescription>
            {currentStep < FORM_STEPS.length
              ? `Step ${currentStep + 1} of ${FORM_STEPS.length}`
              : 'Your reservation has been submitted'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode='wait'>
            {currentStep === 0 && (
              <Step1
                key='step-1'
                onNext={nextStep}
                facilitiesPromise={facilitiesPromise}
                userID={userID}
              />
            )}
            {currentStep === 1 && (
              <Step2 key='step-2' onNext={nextStep} onBack={previousStep} />
            )}
            {currentStep === 2 && (
              <Step3 key='step-3' onNext={nextStep} onBack={previousStep} />
            )}
            {currentStep === 3 && (
              <Step4
                key='step-4'
                onSubmit={handleComplete}
                onBack={previousStep}
                onNext={nextStep}
              />
            )}
            {currentStep === 4 && (
              <StepComplete key='complete' onReset={handleReset} />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
