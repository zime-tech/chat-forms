import { jitsuAnalytics } from "@jitsu/js";
import { getSession } from "auth";

export const getAnalytics = () => {
  const analytics = jitsuAnalytics({
    writeKey: process.env.JITSU_SERVER_WRITE_KEY,
    host: process.env.NEXT_PUBLIC_JITSU_HOST,
  });

  return analytics;
};

export const trackEvent = async (event: string, properties: any) => {
  const analytics = getAnalytics();
  const session = await getSession();

  analytics.identify(session?.user.id, {
    name: session?.user.name,
    email: session?.user.email,
    $doNotSend: true,
  });

  if (session) {
    analytics.track(event, properties);
  }
};

export const analytics = getAnalytics();
