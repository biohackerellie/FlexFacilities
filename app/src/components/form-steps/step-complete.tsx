'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepCompleteProps {
  onReset: () => void;
}

export function StepComplete({ onReset }: StepCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className='space-y-6 text-center'
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className='flex justify-center'
      >
        <div className='rounded-full bg-accent/10 p-6'>
          <CheckCircle2 className='h-16 w-16 text-accent' />
        </div>
      </motion.div>

      <div className='space-y-2'>
        <h2 className='text-2xl font-bold text-balance'>
          Form Submitted Successfully!
        </h2>
        <p className='text-muted-foreground text-balance'>
          Thank you for completing the form. We&apos;ve received your
          information.
        </p>
      </div>

      <Button onClick={onReset} size='lg' variant='outline'>
        Submit another form
      </Button>
    </motion.div>
  );
}
