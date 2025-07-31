"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import type { CreateUserType, UserRole } from "@local/db/schema";

import { api } from "@/trpc/server";

const formSchema = z
  .object({
    email: z.string().email().min(5),
    password: z.string().min(5),
    name: z.string().min(5),
    confirmPassword: z.string().min(5),
    terms: z.union([z.literal("true"), z.literal("false"), z.boolean()]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.terms !== "true", {
    message: "You must agree to the terms and conditions",
  });
type FormSchema = z.infer<typeof formSchema>;
export default async function CreateUser(formData: FormData) {
  const initial: FormSchema = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    name: formData.get("name") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    terms: Boolean(formData.get("terms") as string),
  };
  const data = formSchema.safeParse(initial);
  if (!data.success) {
    throw data.error;
  }
  const newHash = bcrypt.hashSync(data.data.password, 10);
  const newUser = {
    id: uuid(),
    name: data.data.name,
    email: data.data.email,
    emailVerified: null,
    password: newHash,
    provider: "credentials",
    externalUser: true,
    role: "USER" as UserRole,
    tos: data.data.terms,
  };
  try {
    // @ts-expect-error - This is a server-side function, so we can use await here
    await api.user.NewUser(newUser);
    console.log("User created");
  } catch (error) {
    console.log(error);
    throw error;
  }

  revalidateTag("users");
  redirect("/login");
}
