'use client';
import * as React from 'react';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/errors';
import type { FullFacility } from '@/lib/types';
import { updateFacility, uploadImage } from './actions';

interface FormProps {
  data: FullFacility;
}
interface UploadFormProps {
  facilityID: string;
  buildingID: string;
}

const ImageUploadForm = ({ facilityID, buildingID }: UploadFormProps) => {
  const uploadWithParam = uploadImage.bind(null, facilityID, buildingID);
  const [hasFile, setHasFile] = React.useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    toast.promise(uploadWithParam(formData), {
      success: 'Success',
      loading: 'Uploading...',
      position: 'top-center',
      error: (error) => {
        return getErrorMessage(error);
      },
    });
  };
  return (
    <form onSubmit={onSubmit} className='flex'>
      <Label htmlFor='file'>Change Image</Label>
      <Input
        type='file'
        name='file'
        id='file'
        accept='.jpg, .png'
        onChange={(e) => setHasFile(e.target.files?.length! > 0)}
        // className='w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100'
      />
      <Button variant='outline' type='submit' disabled={!hasFile}>
        Upload
      </Button>
    </form>
  );
};

export default function Forms({ data }: FormProps) {
  const facility = data?.facility!;
  const [fac, setFac] = React.useState(facility);
  const handleUpdateFacility = () => {
    toast.promise(updateFacility(fac), {
      success: 'Success',
      loading: 'Updating...',
      error: (error) => {
        return getErrorMessage(error);
      },
    });
  };
  return (
    <div className='my-2 flex flex-col gap-8'>
      <div className='flex flex-row'>
        <ImageUploadForm
          facilityID={facility.id}
          buildingID={data.building?.id!}
        />
      </div>
      <Accordion type='single' collapsible className='w-full'>
        <AccordionItem value='item-1'>
          <AccordionTrigger className='w-full'>Facility Name</AccordionTrigger>
          <AccordionContent>
            <label htmlFor='name'>Name</label>
            <Input
              type='text'
              name='name'
              id='name'
              defaultValue={facility.name}
              placeholder={facility.name}
              onChange={(e) => {
                setFac({ ...fac, name: e.target.value });
              }}
            />
            <Button onClick={() => handleUpdateFacility()} variant='outline'>
              Update
            </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger className='w-full'>Capacity</AccordionTrigger>
          <AccordionContent>
            <label htmlFor='capacity'>Capacity</label>
            <Input
              type='number'
              name='capacity'
              id='capacity'
              placeholder={facility.capacity?.toString() ?? ''}
              onChange={(e) => {
                setFac({ ...fac, capacity: e.target.value });
              }}
            />
            <Button onClick={() => handleUpdateFacility()} variant='outline'>
              Update
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
