"use client";

import { signIn } from "next-auth/react";

const SignIn = () => {
  return (
    <div>
      <button
        className="px-2 py-1 cursor-pointer bg-blue-500 text-white rounded-sm"
        onClick={() => signIn()}
      >
        Login
      </button>
    </div>
  );
};

export default SignIn;