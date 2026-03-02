"use client";

import { ReactNode } from "react";

// Jitsu tracking wrapper - renders children directly when not configured
export default function JitsuWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
