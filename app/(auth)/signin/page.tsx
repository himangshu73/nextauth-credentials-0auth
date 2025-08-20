"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Link from "next/link";

const SignInPage = () => {
  const [submit, setSubmit] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    setSubmit(true);
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (!result) {
        toast.error("No response from server");
        return;
      }

      if (result.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Invalid email or password"
            : result.error;
        toast.error(errorMessage);
        console.error("Login failed:", result.error);
      } else if (result?.ok) {
        toast.success("Signed in successfully");
        router.push(callbackUrl);
      }
    } catch (error) {
      console.log(error);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmit(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rouned-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Sign In
        </h2>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="●●●●●●●●"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-lg transition-all cursor-pointer"
              >
                {submit ? "Signing In" : "Sign In"}
              </Button>
            </form>
          </Form>
          <div className="mt-2 flex items-center justify-between">
            <Link
              href="/signup"
              className="px-2 text-sm underline hover:no-underline"
            >
              Sign Up
            </Link>
            <Link
              href="/forgot-password/email"
              className="px-2 text-sm underline hover:no-underline"
            >
              Forgot Password
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <hr className="w-full border-gray-300" />
          <span className="px-3 text-sm text-gray-500">or</span>
          <hr className="w-full border-gray-300" />
        </div>

        <Button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full bg-black hover:bg-gray-800 text-white py-2 text-lg"
        >
          Sign in with Github
        </Button>
      </div>
    </div>
  );
};

export default SignInPage;
