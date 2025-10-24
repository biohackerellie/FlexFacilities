'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Button } from '../ui/button';

export function UploadFile({ id }: { id: string }) {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    if (!inputFileRef.current?.files) {
      throw new Error('no file selected');
    }
    const file = inputFileRef.current.files[0]!;

    const response = await fetch(
      `/api/files/upload?filename=${file.name}&id=${id}`,
      {
        method: 'POST',
        body: file,
      },
    );
    const result = await response.json();
    if (result.error) {
      alert(result.error);
    } else {
      alert('File uploaded successfully!');
    }
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <input type='file' ref={inputFileRef} accept='.pdf,.docx,.txt,.doc' />
        </div>
        <div className='p-2'>
          {loading ? (
            <Button disabled={true}>
              <Loader2 className='animate-spin' />
              uploading...
            </Button>
          ) : (
            <Button>Upload</Button>
          )}
        </div>
      </form>
    </div>
  );
}
