import * as React from 'react';
import { InputOTPForm } from './form';
import { Spinner } from '@/components/spinner';

export default function verifyPage() {
  return (
    <div className="@container">
      <React.Suspense fallback={<Spinner />}>
        <InputOTPForm />
      </React.Suspense>
    </div>
  );
}
