"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer inside the form builder and form pages
  if (pathname.startsWith("/dashboard/") && pathname !== "/dashboard") return null;
  if (pathname.startsWith("/forms/")) return null;

  return null; // Footer removed for now - can be re-added later
}
