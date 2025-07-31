import { isRedirectError } from "next/dist/client/components/redirect";
import Link from "next/link";
import { AuthError } from "next-auth";

import { signIn } from "@local/auth";

import { Button } from "@/components/ui/buttons";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

async function Login(formData: FormData) {
  "use server";

  await signIn("credentials", {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    redirectTo: "/",
  });
}

export default function LoginForm() {
  return (
    <Card className="flex w-full max-w-3xl flex-col items-center justify-center p-2 text-center align-middle">
      <CardContent>
        <form
          action={async () => {
            "use server";
            await signIn("azure-ad", {
              redirectTo: "/",
            });
          }}
        >
          <Button type="submit" size="lg" variant="outline" className="w-full">
            Use District Staff Account
          </Button>
        </form>
        <form action={Login}>
          <div className="mb-6">
            <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300">
              <p className="mx-4 mb-0 text-center font-semibold text-black drop-shadow-md dark:text-black">
                OR
              </p>
            </div>
            <h1 className="mx4- mb-0 text-center font-bold text-black drop-shadow-md">
              Public User Sign In
            </h1>
            <Input
              required
              type="email"
              name="email"
              id="email"
              placeholder="Email address"
            />
          </div>
          <div className="mb-6">
            <Input
              required
              type="password"
              name="password"
              id="password"
              placeholder="Password"
            />
            <Link
              className="text-sm italic text-blue-500 hover:cursor-pointer hover:underline"
              href="/login/reset"
            >
              Forgot my password
            </Link>
          </div>
          <Button type="submit" variant="outline" className="w-full">
            "Sign In"
          </Button>

          <Button
            asChild
            variant="outline"
            className="mt-2 w-auto justify-center self-center align-middle font-light sm:font-medium"
          >
            <Link href="/login/register" className="w-2/3">
              Don't have an account? Register here!
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
