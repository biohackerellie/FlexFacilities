'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { uploadReservationDocument } from '@/lib/actions/reservations';
import { getErrorMessage } from '@/lib/errors';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function UploadFile({ id }: { id: string }) {
  const [hasFile, setHasFile] = React.useState(false);
  const router = useRouter();

  const uploadWithParam = uploadReservationDocument.bind(null, id);
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    toast.promise(uploadWithParam(formData), {
      success: 'Success',
      loading: 'Uploading...',
      position: 'top-center',
      error: (error) => {
        return getErrorMessage(error);
      },
    });
    router.refresh();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <Input
            type='file'
            name='file'
            id='file'
            accept='.pdf,.docx,.txt,.doc'
            onChange={(e) => setHasFile(e.target.files?.length! > 0)}
          />
        </div>
        <div className='p-2'>
          <Button type='submit' disabled={!hasFile}>
            Upload
          </Button>
        </div>
      </form>
    </div>
  );
}
