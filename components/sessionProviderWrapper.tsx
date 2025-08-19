"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

const SessionProviderWrapper = ({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default SessionProviderWrapper;