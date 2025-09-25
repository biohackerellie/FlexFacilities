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
import { getErrorMessage } from '@/lib/errors';
import { FullFacility } from '@/lib/types';
import { updateCategory, updateFacility } from './actions';

interface FormProps {
  data: FullFacility;
}

// const ImageUploadForm = ({ id }: FormProps) => {
//   const uploadWithParam = uploadImage.bind(null, id);
//   return (
//     <>
//       <form action={uploadWithParam} className="flex">
//         <label htmlFor="file">Change Image</label>
//         <input
//           type="file"
//           name="file"
//           id="file"
//           accept=".jpg, .png"
//           className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
//         />
//         <Button variant="outline">Upload</Button>
//       </form>
//     </>
//   );
// };

export default function Forms({ data }: FormProps) {
  const facility = data?.facility!;
  const categories = data?.categories!;
  const [fac, setFac] = React.useState(facility);
  const [categoriesState, setCategories] = React.useState(categories);
  const handleUpdateFacility = () => {
    toast.promise(updateFacility(fac), {
      success: 'Success',
      loading: 'Updating...',
      error: (error) => {
        return getErrorMessage(error);
      },
    });
  };
  const handleUpdateCategories = (index: number) => {
    toast.promise(updateCategory(categoriesState[index]!), {
      success: 'Success',
      loading: 'Updating...',
      error: (error) => {
        return getErrorMessage(error);
      },
    });
  };
  return (
    <div className="my-2 flex flex-col gap-8">
      {/* <div className="flex flex-row"> */}
      {/*   <ImageUploadForm id={id} /> */}
      {/* </div> */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="w-full">Facility Name</AccordionTrigger>
          <AccordionContent>
            <label htmlFor="name">Name</label>
            <Input
              type="text"
              name="name"
              id="name"
              defaultValue={facility.name}
              placeholder={facility.name}
              onChange={(e) => {
                setFac({ ...fac, name: e.target.value });
              }}
            />
            <Button onClick={() => handleUpdateFacility()} variant="outline">
              Update
            </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="w-full">Capacity</AccordionTrigger>
          <AccordionContent>
            <label htmlFor="capacity">Capacity</label>
            <Input
              type="number"
              name="capacity"
              id="capacity"
              placeholder={facility.capacity?.toString() ?? ''}
              onChange={(e) => {
                setFac({ ...fac, capacity: BigInt(e.target.value) });
              }}
            />
            <Button onClick={() => handleUpdateFacility()} variant="outline">
              Update
            </Button>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="w-full">Prices</AccordionTrigger>
          <AccordionContent>
            {categories?.map((category, index) => (
              <div key={index}>
                <label
                  htmlFor="Category"
                  className="overflow-hidden text-ellipsis"
                >
                  {category.name}
                </label>
                <Input
                  type="number"
                  name="price"
                  id="price"
                  placeholder={category.price?.toString() ?? ''}
                  onChange={(e) => {
                    const newCategories = [...categoriesState];
                    newCategories[index] = {
                      ...category,
                      price: parseFloat(e.target.value),
                    };
                    setCategories(newCategories);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => handleUpdateCategories(index)}
                >
                  Update
                </Button>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
