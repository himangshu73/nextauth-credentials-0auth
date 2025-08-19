"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { verifySchema } from "@/schemas/verifySchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const VerifyPageContent = () => {
  const [submit, setSubmit] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof verifySchema>) {
    try {
      setSubmit(true);
      const response = await axios.post("/api/verify", {
        email,
        otp: values.otp,
      });
      if (response.status === 200) {
        toast.success(response.data.message);
        router.push("/signin");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      setSubmit(false);
    } finally {
      setSubmit(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rouned-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          OTP Verification
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="OTP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 text-lg transition-all cursor-pointer"
            >
              {submit ? "Verifing OTP" : "Verify OTP"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

const VerifyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
};

export default VerifyPage;
