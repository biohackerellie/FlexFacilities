'use server';

import { revalidateTag } from 'next/cache';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
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
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  await authed.facilities().updateFacility({ facility });
  revalidateTag('facilities', 'max');
}

export async function deleteFacility(id: string) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  await authed.facilities().deleteFacility({ id });
  revalidateTag('facilities', 'max');
}

export async function updateCategory(category: Category) {
  const { session, token } = await getCookies();
  if (!session || !token) {
    throw new Error('No session or token found');
  }
  const authed = client.withAuth(session, token);
  await authed.facilities().updateFacilityCategory({ category });
  revalidateTag('facilities', 'max');
}
