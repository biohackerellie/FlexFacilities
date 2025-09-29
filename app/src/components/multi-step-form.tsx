'use client';

import { AnimatePresence } from 'framer-motion';
import { useFormStore } from '@/lib/form-store';
import { FormProgress } from '@/components/form-progress';
import { Step1 } from '@/components/form-steps/step-1';
import { Step2 } from '@/components/form-steps/step-2';
import { Step3 } from '@/components/form-steps/step-3';
import { StepComplete } from '@/components/form-steps/step-complete';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const FORM_STEPS = [
  {
    title: 'Personal Info',
    description: 'Basic details',
  },
  {
    title: 'Contact',
    description: 'How to reach you',
  },
  {
    title: 'Preferences',
    description: 'Your choices',
  },
];

export function MultiStepForm() {
  const { currentStep, nextStep, previousStep, resetForm } = useFormStore();

  const handleComplete = () => {
    console.log('[v0] Form completed successfully');
    nextStep();
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {currentStep < FORM_STEPS.length && (
        <FormProgress
          currentStep={currentStep}
          totalSteps={FORM_STEPS.length}
          steps={FORM_STEPS}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {currentStep < FORM_STEPS.length
              ? FORM_STEPS[currentStep].title
              : 'Complete'}
          </CardTitle>
          <CardDescription>
            {currentStep < FORM_STEPS.length
              ? `Step ${currentStep + 1} of ${FORM_STEPS.length}`
              : 'Your form has been submitted'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {currentStep === 0 && <Step1 key="step-1" onNext={nextStep} />}
            {currentStep === 1 && (
              <Step2 key="step-2" onNext={nextStep} onBack={previousStep} />
            )}
            {currentStep === 2 && (
              <Step3
                key="step-3"
                onSubmit={handleComplete}
                onBack={previousStep}
              />
            )}
            {currentStep === 3 && (
              <StepComplete key="complete" onReset={handleReset} />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
