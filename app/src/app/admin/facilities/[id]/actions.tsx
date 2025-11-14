'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { client } from '@/lib/rpc';
import { getCookies } from '@/lib/setHeader';
import type { Category, Facility } from '@/lib/types';

export async function uploadImage(
  facilityID: string,
  buildingID: string,
  formData: FormData,
) {
  try {
    const { session, token } = await getCookies();
    if (!session || !token) {
      throw new Error('No session or token found');
    }
    const url = new URL(
      `${process.env.FRONTEND_URL}/api/files/images/${buildingID}/${facilityID}`,
    );

    await fetch(url, {
      method: 'POST',
      headers: {
        // Don't set Content-Type manually - let fetch set it with boundary
        'X-Session': session,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (error) {
    throw new Error('error uploading file', { cause: error });
  }

  revalidateTag('facilities', 'max');
  revalidateTag(`facility-${facilityID}`, 'max');
  revalidatePath(`/admin/facilities/${facilityID}`);
}

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
