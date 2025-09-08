import { TosModal } from '@/components/forms';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CreateUser from '@/functions/mutations/create-user';

export default function CreateAccount() {
  return (
    <Card className="flex w-full max-w-3xl flex-col items-center justify-center p-2 text-center align-middle">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4">
        <form action={CreateUser}>
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="First and Last name"
            id="name"
            name="name"
          />

          <Label>Email</Label>
          <Input type="email" id="email" name="email" placeholder="Email" />
          <div className="flex w-full gap-4 pt-6">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Password"
              id="password"
              name="password"
            />
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              placeholder="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
            />
          </div>
          <div className="mt-6 w-auto justify-center self-center py-4 align-middle font-light sm:font-medium">
            <Checkbox
              id="terms"
              name="terms"
              value="true"
              defaultValue="false"
            />
            <label htmlFor="terms" className="m-2 inline">
              I agree to the{' '}
              <strong className="">
                {' '}
                <TosModal />
              </strong>
            </label>
          </div>

          <CardFooter className="flex justify-center align-middle">
            <Button type="submit">Create Account</Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
