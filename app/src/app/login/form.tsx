import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as z from "zod"

async function Login(state: FormState, formData: FormData) {
  "use server";

  const validated = loginSchema.safeParse({
    email: formData.get("email"), 
    password: formData.get("password")
  })

  if (!validated.success){
    return {
      errors: validated.error.flatten
    }
  }

  await fetch("/api/auth/login", {
    method: "POST",
    body: formData
  })
}

const loginSchema = z.object({
  email: z.email('Email is required').trim(),
  password: z.string().min(8, 'Password must be at least 8 characters').trim(),
})


type FormState = 
  | {
  errors?: {
    email?: string
    password?: string
  }
  message?: string
}
| undefined

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
    <Card>
    <CardHeader className="text-center">
   <CardTitle className="text-xl">Welcome Back</CardTitle> 
   <CardDescription>Sign in to your account</CardDescription>
    </CardHeader>
      <CardContent>
        <form action={Login}>
          <Button type="submit" size="lg" variant="outline" className="w-full">
            Use District Staff Account
          </Button>
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
</div>

  );
}
