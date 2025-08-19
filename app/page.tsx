"use client";

import SignIn from "@/components/sign-in";
import SignOut from "@/components/sign-out";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const user = session?.user;
  return (
    <div className="flex items-center justify-center min-h-screen">
      {status === "authenticated" ? (
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
          <SignOut />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <SignIn />
          <Link
            href="/signup"
            className="text-red-500 font-bold hover:underline"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
