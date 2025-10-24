'use server';

import { revalidateTag } from 'next/cache';
import { client } from '@/lib/rpc';
import type { Category, Facility } from '@/lib/types';

// export async function uploadImage(id: number, formData: FormData) {
//   const file = formData.get('file') as File;
//   if (file.size > 4780032) {
//     throw new Error('File must be less than 4.5MB');
//   }
//   let filePath = '';
//   try {
//     const fileName = file?.name;
//     const imagePath = path.join(`/images/uploads`, fileName);
//     const imageStream = fs.createWriteStream(imagePath);
//     filePath = imagePath;
//     imageStream.write(Buffer.from(await file.arrayBuffer()));
//     imageStream.end();
//   } catch (error) {
//     throw new Error('error uploading file', { cause: error });
//   } finally {
//     await db
//       .update(Facility)
//       .set({ imagePath: filePath })
//       .where(eq(Facility.id, id));
//   }

//   revalidateTag('facilities');
// }

export async function updateFacility(facility: Facility) {
  await client.facilities().updateFacility({ facility });
  revalidateTag('facilities');
}

export async function deleteFacility(id: string) {
  await client.facilities().deleteFacility({ id });
  revalidateTag('facilities');
}

export async function updateCategory(category: Category) {
  await client.facilities().updateFacilityCategory({ category });
  revalidateTag('facilities');
}
