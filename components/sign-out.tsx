"use client";

import { signOut } from "next-auth/react";

const SignOut = () => {
  return (
    <div>
      <button
        className="px-2 py-1 cursor-pointer bg-red-500 text-white rounded-sm"
        onClick={() => signOut()}
      >
        Logout
      </button>
    </div>
  );
};

export default SignOut;