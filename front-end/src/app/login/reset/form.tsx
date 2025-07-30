import React from "react";

import { Button } from "@/components/ui/buttons";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Email } from "@/functions/mutations/reset";

export default function ResetPassword() {
  return (
    <Card className="flex w-full max-w-3xl flex-col items-center justify-center p-2 text-center align-middle">
      <CardContent>
        <form action={Email} className="space-y-8">
          <h1 className="text-4xl font-bold">Password Reset</h1>

          <Input
            type="email"
            name="email"
            id="email"
            required
            placeholder="Email address"
            className="block rounded-md border-slate-300 py-2 pl-9 shadow-sm placeholder:italic placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <div>
            <p>
              If your email is registered with us, you will receive a password
              reset link.
            </p>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
