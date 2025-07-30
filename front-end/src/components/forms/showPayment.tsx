"use client";

import { error } from "console";
import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import PiP from "@/functions/mutations/pip";
import { GeneratePaymentLink } from "@/functions/other/payments";
import { Button } from "../ui/buttons";

interface feeProps {
  id: number;
  fees: number;
  description: string;
  email: string;
}

export default function ShowPayment({
  id,
  fees,
  description,
  email,
}: feeProps) {
  const [isLoading, startTransition] = React.useTransition();
  function PayOnline(
    id: number,
    fees: number,
    description: string,
    email: string,
  ) {
    startTransition(() => {
      toast.promise(GeneratePaymentLink(id, fees, description, email), {
        loading: "Creating payment link...",
        success: () => {
          return "success!";
        },
        error: (error) => {
          return "something went wrong";
        },
      });
    });
  }
  function PayinPerson(id: number) {
    startTransition(() => {
      toast.promise(PiP(id), {
        loading: "loading...",
        success: () => {
          return "success!";
        },
        error: (error) => {
          return error.message;
        },
      });
    });
  }
  return (
    <div className="block gap-x-2 p-2">
      <>
        <Button
          disabled={isLoading}
          variant="outline"
          onClick={() => PayinPerson(id)}
        >
          Pay in Person
        </Button>

        <Button
          disabled={isLoading}
          variant="outline"
          onClick={() => PayOnline(id, fees, description, email)}
        >
          Pay Online
        </Button>
      </>
    </div>
  );
}
