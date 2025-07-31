import React from "react";
import { notFound } from "next/navigation";

import { auth } from "@local/auth";

import { Separator } from "@/components/ui/separator";
import AccountForm from "./account-form";

export default async function DetailsPage() {
  const session = await auth();
  if (!session) {
    return notFound();
  }

  const data = session.user;
  const updateUserValues = {
    id: data.id,
    name: data.name!,
    email: data.email!,
  };
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Details</h3>
        <p className="text-muted-foreground">Change your account details</p>
      </div>
      <Separator />
      <AccountForm data={updateUserValues} />
    </div>
  );
}
