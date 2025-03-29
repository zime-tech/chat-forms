"use client";

import { JitsuProvider, useJitsu } from "@jitsu/jitsu-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useConsent } from "./consent-provider";

/**
 * JitsuTracker is a client component that tracks the current route and user.
 * Tracking is in a subcomponent so we're sure that it's inside the JitsuProvider.
 */
function JitsuTracker() {
  const pathname = usePathname();
  const { analytics } = useJitsu();
  const session = useSession();
  const { isTrackingEnabled } = useConsent();

  // track page views only if consent is given
  useEffect(() => {
    if (isTrackingEnabled) {
      analytics.page();
    }
  }, [pathname, isTrackingEnabled]);

  // track current user only if consent is given
  useEffect(() => {
    if (isTrackingEnabled && session.data?.user) {
      analytics.identify(session.data.user.id, {
        email: session.data.user.email,
      });
    }
  }, [session, isTrackingEnabled]);

  return null;
}

/**
 * JitsuWrapper is a client component that wraps the app in a JitsuProvider.
 * The wrapper was used to avoid the "use client" directive in the root layout.
 */
export default function JitsuWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <JitsuProvider
      options={{
        writeKey: process.env.NEXT_PUBLIC_JITSU_WRITE_KEY,
        host: process.env.NEXT_PUBLIC_JITSU_HOST!,
      }}
    >
      <JitsuTracker />
      {children}
    </JitsuProvider>
  );
}
