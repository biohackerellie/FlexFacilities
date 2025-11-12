'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import shimmer from '@/components/shimmer';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { toBase64 } from '@/lib/utils';

export type TableFacility = {
  id: string;
  name: string;
  building: string;
  address: string;
  imagePath: string | undefined;
  capacity: string | undefined;
  googleCalendarId: string;
  Category: string[];
};
export const columns: ColumnDef<TableFacility>[] = [
  {
    accessorKey: 'imagePath',
    header: 'Image',
    cell: ({ row }) => {
      const imagePath = row.original.imagePath;
      return (
        <AspectRatio ratio={4 / 3}>
          {imagePath ? (
            <Image
              src={`/api/files${imagePath}`}
              alt={'image'}
              fill
              className='rounded-md object-cover h-full w-full'
              placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
              blurDataURL='data:image/png'
              sizes='(max-width: 600px)(max-height: 600px) 100vw, 33vw'
              loading='lazy'
            />
          ) : (
            <Image
              src='/logo.png'
              alt='image'
              fill
              sizes='(max-width: 400px) 100vw, 33vw'
              className='grayscale opacity-40'
            />
          )}
        </AspectRatio>
      );
    },
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'building',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Building
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
  },
  {
    accessorKey: 'Category',
    header: 'Category Prices',
    cell: ({ row }) => {
      const prices = row.original.Category;
      return (
        <>
          {prices?.map((price, index) => (
            <div key={index}>${price}/hr</div>
          ))}
        </>
      );
    },
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button variant='link' asChild>
          <Link href='/admin/facilities/new'>New Facility</Link>
        </Button>
      );
    },
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Button variant='link' asChild>
          <Link href={`/admin/facilities/${id}`}>Edit</Link>
        </Button>
      );
    },
  },
];
