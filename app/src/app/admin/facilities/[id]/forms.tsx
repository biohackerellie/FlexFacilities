'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { updateCategory, updateFacility } from './actions';
import { Facility } from '@/lib/types';

interface FormProps {
  facility: Facility;
  categories: Facility;
}

const inputStyle =
  ' mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-xs placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none  disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500 ';

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

const FacilityNameForm = ({ id, name }: FormProps) => {
  const updateWithParam = updateFacilityName.bind(null, id);
  return (
    <>
      <form action={updateWithParam}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          defaultValue={name}
          placeholder={name}
          className={inputStyle}
        />
        <Button variant="outline">Update</Button>
      </form>
    </>
  );
};

const UpdatePricesForm = ({ CategoryIDs }: FormProps) => {
  return (
    <>
      {CategoryIDs?.map((category, index) => (
        <div key={index}>
          <form action={updateCategoryPrices} className="my-4 gap-y-4">
            <label htmlFor="Category" className="overflow-hidden text-ellipsis">
              {category.name}
            </label>
            <input type="hidden" name="id" id="id" value={category.id} />
            <label htmlFor="price">Price</label>
            <input
              type="number"
              name="price"
              id="price"
              defaultValue={category.price}
              className={inputStyle}
            />
            <Button variant="outline">Update</Button>
          </form>
        </div>
      ))}
    </>
  );
};

const UpdateCapacityForm = ({ id, capacity }: FormProps) => {
  const updateCapaciatywithID = updateCapaciaty.bind(null, id);
  return (
    <>
      <form action={updateCapaciatywithID}>
        <label htmlFor="capacity">Capacity</label>
        <input
          type="number"
          name="capacity"
          id="capacity"
          defaultValue={capacity}
          className={inputStyle}
        />
        <Button variant="outline">Update</Button>
      </form>
    </>
  );
};

export default function Forms({ id, name, capacity, CategoryIDs }: FormProps) {
  return (
    <div className="my-2 flex flex-col gap-8">
      {/* <div className="flex flex-row"> */}
      {/*   <ImageUploadForm id={id} /> */}
      {/* </div> */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="w-full">Facility Name</AccordionTrigger>
          <AccordionContent>
            <FacilityNameForm id={id} name={name} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger className="w-full">Capacity</AccordionTrigger>
          <AccordionContent>
            <UpdateCapacityForm id={id} capacity={capacity} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger className="w-full">Prices</AccordionTrigger>
          <AccordionContent>
            <UpdatePricesForm id={id} CategoryIDs={CategoryIDs} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
