"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Define types for consent state
type ConsentStatus = "pending" | "accepted" | "rejected";

interface ConsentContextType {
  status: ConsentStatus;
  isTrackingEnabled: boolean;
  acceptConsent: () => void;
  rejectConsent: () => void;
  resetConsent: () => void;
}

// Create context with default values
const ConsentContext = createContext<ConsentContextType>({
  status: "pending",
  isTrackingEnabled: false,
  acceptConsent: () => {},
  rejectConsent: () => {},
  resetConsent: () => {},
});

// Custom hook for accessing consent context
export const useConsent = () => useContext(ConsentContext);

// Cookie name for storing consent
const CONSENT_COOKIE_NAME = "tracking-consent";

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>("pending");

  // Parse consent from cookie on initial load
  useEffect(() => {
    const storedConsent = getCookie(CONSENT_COOKIE_NAME);
    if (storedConsent) {
      setStatus(storedConsent as ConsentStatus);
    }
  }, []);

  // Update cookie when status changes
  useEffect(() => {
    if (status !== "pending") {
      setCookie(CONSENT_COOKIE_NAME, status, 365); // Store for 1 year
    }
  }, [status]);

  // Helper function to get cookie
  function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];

    return cookieValue || null;
  }

  // Helper function to set cookie
  function setCookie(name: string, value: string, days: number) {
    if (typeof document === "undefined") return;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);

    document.cookie = `${name}=${value}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax`;
  }

  // Consent management functions
  const acceptConsent = () => setStatus("accepted");
  const rejectConsent = () => setStatus("rejected");
  const resetConsent = () => {
    setStatus("pending");
    document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Determine if tracking should be enabled
  const isTrackingEnabled = status === "accepted";

  return (
    <ConsentContext.Provider
      value={{
        status,
        isTrackingEnabled,
        acceptConsent,
        rejectConsent,
        resetConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}
