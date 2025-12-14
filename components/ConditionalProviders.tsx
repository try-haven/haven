"use client";

import { usePathname } from "next/navigation";
import { DarkModeProvider } from "@/contexts/DarkModeContext";
import { UserProvider } from "@/contexts/UserContext";
import { ListingsProvider } from "@/contexts/ListingsContext";
import { LikedListingsProvider } from "@/contexts/LikedListingsContext";

export function ConditionalProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public routes that don't need any contexts (including dark mode)
  const isPublicRoute = pathname?.startsWith('/listing');

  if (isPublicRoute) {
    // For public routes, render children without any contexts
    return <>{children}</>;
  }

  // For authenticated routes, wrap with all contexts including dark mode
  return (
    <DarkModeProvider>
      <UserProvider>
        <ListingsProvider>
          <LikedListingsProvider>{children}</LikedListingsProvider>
        </ListingsProvider>
      </UserProvider>
    </DarkModeProvider>
  );
}
