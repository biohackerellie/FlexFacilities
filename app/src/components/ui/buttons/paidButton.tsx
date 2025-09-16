'use client';

import { Paid } from '@/functions/mutations';
import { Button } from './index';

export default function PaidButton({ id }: any) {
  return (
    <>
      <Button onClick={() => Paid(id)}>Mark as paid</Button>
    </>
  );
}
