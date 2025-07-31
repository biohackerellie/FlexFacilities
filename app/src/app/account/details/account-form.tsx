import { Button } from "@/components/ui/buttons";
import { Separator } from "@/components/ui/separator";
import { Update } from "./actions";

interface UserName {
  id: string;
  name: string;
  email: string;
}

export default function AccountForm({ data }: { data: UserName }) {
  const updateUserID = Update.bind(null, data.id);
  let disabled = false;
  if (data.email.includes("@laurel.k12.mt.us")) {
    disabled = true;
  }
  return (
    <form action={updateUserID} className="space-y-8">
      <label className="block text-lg font-bold">Name: {data.name} </label>
      <input
        className="border-forground form-input rounded-sm text-black ring-transparent"
        name="name"
        type="text"
        id="name"
        disabled={disabled}
        placeholder={data.name}
      />
      <p className="text-md text-muted-foreground">
        The name of the individual or organization on the account. Staff
        accounts can not update their names.
      </p>
      <Separator />
      <label className="block text-lg font-bold">Email: {data.email} </label>
      <input
        className="border-forground form-input rounded-sm text-black ring-transparent"
        name="email"
        type="email"
        id="email"
        disabled={disabled}
        placeholder={data.email}
      />
      <p className="text-md text-muted-foreground">
        The email address associated with the account. Public Users may update
        at any time. If your account is an LPS account, please contact an
        administrator to update your email address on the account.
      </p>
      <Separator />
      <Button className="float-right" />
    </form>
  );
}
