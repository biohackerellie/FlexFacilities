import * as React from 'react';
import { Spinner } from '@/components/spinner';
import { InputOTPForm } from './form';

export default function verifyPage() {
  return (
    <div className='@container'>
      <React.Suspense fallback={<Spinner />}>
        <InputOTPForm />
      </React.Suspense>
    </div>
  );
}
