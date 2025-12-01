'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { getAllProducts, getFacilities } from '@/lib/actions/facilities';
import { updateReservation } from '@/lib/actions/reservations';
import type { Facility, PricingWithCategory } from '@/lib/types';
import { ReservationContext } from './context';

export default function Options({
  facilitiesPromise,
  productsPromise,
}: {
  facilitiesPromise: Promise<Awaited<ReturnType<typeof getFacilities>>>;
  productsPromise: Promise<Awaited<ReturnType<typeof getAllProducts>>>;
}) {
  const data = React.use(ReservationContext);
  const fac = React.use(facilitiesPromise);

  const catData = React.use(productsPromise);
  if (!data || !fac || !catData) return <div>no data</div>;
  const facilities = fac?.buildings.flatMap((b) => b.facilities);
  const facility = data?.facility;
  const reservation = data?.reservation;
  const products = catData?.data.filter(
    (c) => c.productId === facility?.productId,
  );
  let categories: PricingWithCategory[] = [];
  if (products?.length > 1) {
    categories = products.flatMap((p) => p.pricing);
  } else if (products?.length === 1) {
    categories = products[0]?.pricing ?? [];
  }
  let override = parseFloat(data?.reservation.costOverride);
  if (Number.isNaN(override)) override = 0;
  const [costOverride, setCostOverride] = React.useState(override);
  const [selectedFacility, setSelectedFacility] = React.useState<
    Facility | undefined
  >(facility);
  const [selectedCategory, setSelectedCategory] = React.useState(
    reservation.categoryId,
  );
  const onSelectChange = (facilityId: string) => {
    setSelectedFacility(facilities?.find((f) => f.id === facilityId));
  };
  const onSelectCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };
  const overrideCost = async () => {
    await updateReservation({
      ...reservation,
      costOverride: String(costOverride),
    });
  };
  const changeFacility = async () => {
    if (!selectedFacility) return;
    await updateReservation({
      ...reservation,
      facilityId: selectedFacility.id,
    });
  };
  const changeCategory = async () => {
    await updateReservation({
      ...reservation,
      categoryId: selectedCategory,
    });
  };
  return (
    <Tabs defaultValue='Cost'>
      <TabsList className='grid w-full grid-cols-3'>
        <TabsTrigger value='Cost'>Total Cost Override</TabsTrigger>
        <TabsTrigger value='Facility'>Change Facility</TabsTrigger>
        <TabsTrigger value='Category'>Change Category</TabsTrigger>
      </TabsList>
      <TabsContent value='Cost'>
        <Card className='m-2 flex flex-col gap-2 p-2 items-center justify-center align-middle'>
          <Label htmlFor='newCost'>Manually Set Total</Label>
          <Input
            className='w-auto text-black'
            type='number'
            name='newCost'
            value={costOverride}
            onChange={(e) => setCostOverride(parseFloat(e.target.value))}
          />
          <Button
            variant='outline'
            className='flex justify-end self-end'
            onClick={() => overrideCost()}
          >
            Submit
          </Button>
        </Card>
      </TabsContent>
      <TabsContent value='Facility'>
        <Card className='m-2 flex h-auto flex-col items-center justify-center align-middle'>
          <Label htmlFor='newFacility'>Change Facility</Label>
          <Select
            onValueChange={onSelectChange}
            value={String(selectedFacility?.id ?? '')}
          >
            <SelectTrigger className='w-[180px]'>
              {selectedFacility?.name ?? 'Facility'}
            </SelectTrigger>
            <SelectContent className='max-h-80 overflow-scroll'>
              {facilities?.map((location) => (
                <SelectItem key={location.id} value={String(location.id)}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            className='flex justify-end self-end'
            onClick={() => changeFacility()}
          >
            Submit
          </Button>
        </Card>
      </TabsContent>
      <TabsContent value='Category'>
        <Card className='m-2 flex h-auto flex-col items-center justify-center align-middle'>
          <Label htmlFor='newCategory'>Change Category</Label>
          <Select
            onValueChange={onSelectCategoryChange}
            value={String(selectedCategory)}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Category' />
            </SelectTrigger>
            <SelectContent className='max-h-80 overflow-scroll'>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.categoryName}${category.price}/{category.unitLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant='outline'
            className='flex justify-end self-end'
            onClick={() => changeCategory()}
          >
            Submit
          </Button>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
