'use client';
import { Button } from '../button';
import { Spinner } from '@/components/spinner';
import { cn } from '@/lib/utils';

type Props = {
  children?: React.ReactNode;
  className?: string;
  pending?: boolean;
};

export function SubmitButton({ children, className, pending }: Props) {
  return (
    <Button type="submit" disabled={pending} className={cn(className)}>
      {pending && <Spinner />}
      {children ?? 'Submit'}
    </Button>
  );
}
