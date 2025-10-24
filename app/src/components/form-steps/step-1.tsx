'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import type { getFacilities } from '@/lib/actions/facilities';
import { type Step1Data, step1Schema } from '@/lib/form-schemas';
import { useFormStore } from '@/lib/form-store';
import type { Building, FacilityWithCategories } from '@/lib/types';
import { Spinner } from '../spinner';

interface Step1Props {
  onNext: () => void;
  facilitiesPromise: Promise<Awaited<ReturnType<typeof getFacilities>>>;
  userID: string;
}

export function Step1({ onNext, facilitiesPromise, userID }: Step1Props) {
  const { formData, updateFormData } = useFormStore();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [selectedBuildingFacilities, setSelectedBuildingFacilities] = useState<
    FacilityWithCategories[] | null
  >(null);
  const [selectedFacility, setSelectedFacility] =
    useState<FacilityWithCategories | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [view, setView] = useState<'buildings' | 'facilities' | 'categories'>(
    'buildings',
  );
  const data = use(facilitiesPromise);
  const buildingsData = data?.buildings;
  if (!buildingsData) {
    return (
      <div>
        <Spinner /> Loading...
      </div>
    );
  }

  const {
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      userID: userID || formData.userID,
    },
  });

  useEffect(() => {
    if (userID && !formData.userID) {
      setValue('userID', userID);
      updateFormData({ userID });
    }
  }, [userID, formData.userID, setValue, updateFormData]);

  const handleBuildingSelect = (buildingId: string) => {
    const building = buildingsData.find((b) => b.building?.id === buildingId);
    if (!building || !building.building) {
      return;
    }

    setSelectedBuilding(building.building);

    setSelectedBuildingFacilities(() => {
      const flat = buildingsData.flatMap((f) => f.facilities);
      return flat.filter((f) => f.facility?.buildingId === buildingId);
    });

    setView('facilities');
  };

  const handleFacilitySelect = (facilityId: string) => {
    setValue('facilityID', facilityId);
    updateFormData({ facilityID: facilityId }); // Declare facilityID variable here
    const facility = selectedBuildingFacilities?.find(
      (f) => f.facility?.id === facilityId,
    );
    if (!facility || !facility.facility) {
      return;
    }
    setSelectedFacility(facility);
    setView('categories');
  };

  const handleCategorySelect = (categoryId: string) => {
    setValue('categoryID', categoryId);
    updateFormData({ categoryID: categoryId });
    setSelectedCategory(categoryId);
  };

  const onSubmit = (data: Step1Data) => {
    updateFormData(data);
    onNext();
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-6'
    >
      <AnimatePresence mode='wait'>
        {view === 'buildings' && (
          <motion.div
            key='buildings'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <h3 className='text-lg font-semibold'>Select a Building</h3>
              <p className='text-sm text-muted-foreground'>
                Choose the building where you'd like to reserve a facility
              </p>
            </div>

            <div className='grid gap-3'>
              {buildingsData.map((item) => (
                <motion.button
                  key={item.building?.id}
                  type='button'
                  onClick={() => handleBuildingSelect(item.building?.id ?? '')}
                  className='group relative flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.building?.imagePath && (
                    <Image
                      src={item.building?.imagePath || '/placeholder.svg'}
                      alt={item.building?.name}
                      className='h-16 w-16 rounded-md object-cover'
                    />
                  )}
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Building2 className='h-4 w-4 text-muted-foreground' />
                      <h4 className='font-semibold'>{item.building?.name}</h4>
                    </div>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <MapPin className='h-3 w-3' />
                      <span>{item.building?.address}</span>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {item.facilities.length} facilities available
                    </p>
                  </div>
                  <ChevronRight className='h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1' />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'facilities' && selectedBuildingFacilities && (
          <motion.div
            key='facilities'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setView('buildings')}
                className='mb-2 -ml-2'
              >
                ← Back to Buildings
              </Button>
              <h3 className='text-lg font-semibold'>
                {selectedBuilding?.name}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Select a facility to reserve
              </p>
            </div>

            <div className='grid gap-3'>
              {selectedBuildingFacilities.map((facility, i) => (
                <motion.button
                  key={i}
                  type='button'
                  onClick={() =>
                    handleFacilitySelect(facility.facility?.id ?? '')
                  }
                  className={`group relative flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md ${
                    selectedFacility?.facility?.id === facility.facility?.id
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='flex-1 space-y-1'>
                    <h4 className='font-semibold'>{facility.facility?.name}</h4>
                  </div>
                  {formData.facilityID === facility.facility?.id && (
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                      <svg
                        className='h-3 w-3'
                        fill='currentColor'
                        viewBox='0 0 12 12'
                      >
                        <path
                          d='M10 3L4.5 8.5L2 6'
                          stroke='currentColor'
                          strokeWidth='2'
                          fill='none'
                        />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {errors.facilityID && (
              <p className='text-sm text-destructive'>
                {errors.facilityID.message}
              </p>
            )}
          </motion.div>
        )}
        {view === 'categories' && selectedFacility && (
          <motion.div
            key='categories'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className='space-y-4'
          >
            <div className='space-y-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setView('facilities')}
                className='mb-2 -ml-2'
              >
                ← Back to Facilities
              </Button>
              <h3 className='text-lg font-semibold'>
                {selectedFacility.facility?.name}
              </h3>
              <p className='text-sm text-muted-foreground'>
                Select a category to reserve
              </p>
            </div>

            <div className='grid gap-3'>
              {selectedFacility.categories.map((category) => (
                <motion.button
                  key={category.id}
                  type='button'
                  onClick={() => handleCategorySelect(category.id)}
                  className={`group relative flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md ${
                    selectedCategory === category.id
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='flex-1 space-y-1'>
                    <h4 className='font-semibold'>{category.name}</h4>
                    <p className='text-sm text-muted-foreground'>
                      {category.description}
                    </p>
                  </div>
                  {formData.categoryID === category.id && (
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground'>
                      <svg
                        className='h-3 w-3'
                        fill='currentColor'
                        viewBox='0 0 12 12'
                      >
                        <path
                          d='M10 3L4.5 8.5L2 6'
                          stroke='currentColor'
                          strokeWidth='2'
                          fill='none'
                        />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view === 'categories' && formData.facilityID && formData.categoryID && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex justify-end'
        >
          <Button type='submit' size='lg' className='min-w-32'>
            Next
          </Button>
        </motion.div>
      )}
    </motion.form>
  );
}
