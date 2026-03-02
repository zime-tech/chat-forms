// Server-side analytics tracking
// No-ops gracefully when Jitsu is not configured

export const trackEvent = async (event: string, properties: Record<string, unknown>) => {
  // Skip tracking if Jitsu is not configured
  if (!process.env.JITSU_SERVER_WRITE_KEY || !process.env.NEXT_PUBLIC_JITSU_HOST) {
    return;
  }

  try {
    const { jitsuAnalytics } = await import("@jitsu/js");
    const { getSession } = await import("auth");

    const analytics = jitsuAnalytics({
      writeKey: process.env.JITSU_SERVER_WRITE_KEY,
      host: process.env.NEXT_PUBLIC_JITSU_HOST,
    });

    const session = await getSession();

    if (session?.user) {
      analytics.identify(session.user.id, {
        name: session.user.name,
        email: session.user.email,
        $doNotSend: true,
      });
      analytics.track(event, properties);
    }
  } catch {
    // Silently ignore tracking errors
  }
};
