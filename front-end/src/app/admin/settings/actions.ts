"use server";

import { revalidatePath } from "next/cache";
import { TrashIcon } from "lucide-react";
import z from "zod";

import {
  CreateEmailNotificationsSchema,
  UpdateEmailNotificationsSchema,
} from "@local/db/schema";

import { api } from "@/trpc/server";

export type CreateEmailNotifications = z.infer<
  typeof CreateEmailNotificationsSchema
>;
export type UpdateEmailNotifications = z.infer<
  typeof UpdateEmailNotificationsSchema
>;

export async function DeleteEmail(email: string) {
  try {
    await api.user.DeleteEmailPrefsByAddress({ email: email });
  } catch (error) {
    console.error(error);
  }
  revalidatePath("/admin/settings", "page");
}

export async function UpdateNotifications(data: UpdateEmailNotifications) {
  try {
    await api.user.UpdateEmailPrefs(data);
  } catch (error) {
    console.error(error);
  }
  revalidatePath("/admin/settings", "page");
}

export async function CreateEmail(prevState: any, formData: FormData) {
  const initial: CreateEmailNotifications = {
    email: formData.get("email") as string,
    HsEmails: Boolean(formData.get("HsEmails") as string),
    MsEmails: Boolean(formData.get("MsEmails") as string),
    GrEmails: Boolean(formData.get("GrEmails") as string),
    WeEmails: Boolean(formData.get("WeEmails") as string),
    SoEmails: Boolean(formData.get("SoEmails") as string),
    StEmails: Boolean(formData.get("StEmails") as string),
  };
  console.log(initial);
  const data = CreateEmailNotificationsSchema.safeParse(initial);
  if (!data.success) {
    return {
      errors: JSON.stringify(data.error.flatten().fieldErrors),
      message: null,
    };
  }
  try {
    await api.user.CreateEmailPrefs(data.data);
  } catch (error) {
    if (error instanceof Error) {
      return {
        errors: `Something went wrong: ${error.message}`,
        message: null,
      };
    } else {
      return {
        errors: `Something went wrong`,
      };
    }
  }
  revalidatePath("/admin/settings", "page");
  return {
    errors: null,
    message: "Email added successfully",
  };
}
