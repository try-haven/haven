"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import OnboardingLanding from "@/components/OnboardingLanding";
import AddressInput from "@/components/AddressInput";
import CommutePreference from "@/components/CommutePreference";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useUser();
  const [view, setView] = useState<"marketing" | "onboarding" | "address" | "commute">("marketing");
  const [userAddress, setUserAddress] = useState<string>("");
  const isExplicitHome = searchParams.get("home") === "true";

  // Check if user is logged in on initial mount and redirect to swipe
  // But don't redirect if explicitly navigating to home via "Back to Home"
  useEffect(() => {
    if (isLoggedIn && view === "marketing" && !isExplicitHome) {
      router.push("/swipe");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isExplicitHome]); // Only run when login status or explicit home changes

  // Marketing landing page
  if (view === "marketing") {
    return (
      <LandingPage
        onGetStarted={() => {
          if (isLoggedIn) {
            router.push("/swipe");
          } else {
            setView("onboarding");
          }
        }}
      />
    );
  }

  // Onboarding landing (Sign Up/Log in)
  if (view === "onboarding") {
    return (
      <OnboardingLanding
        onSignUp={() => {
          router.push("/preferences");
        }}
        onLogIn={() => {
          // On login, just go to swipe - preferences are optional and can be accessed via navbar
          router.push("/swipe");
        }}
        onBack={() => setView("marketing")}
      />
    );
  }

  // Address input (for onboarding flow)
  if (view === "address") {
    const currentAddress = userAddress || (typeof window !== 'undefined' ? localStorage.getItem("haven_user_address") || "" : "");
    return (
      <AddressInput
        onNext={(address) => {
          setUserAddress(address);
          localStorage.setItem("haven_user_address", address);
          setView("commute");
        }}
        onBack={() => setView("onboarding")}
        initialAddress={currentAddress}
      />
    );
  }

  // Commute preference (for onboarding flow)
  if (view === "commute") {
    const currentCommuteOptions = typeof window !== 'undefined' 
      ? (localStorage.getItem("haven_user_commute") ? JSON.parse(localStorage.getItem("haven_user_commute")!) : [])
      : [];
    return (
      <CommutePreference
        onNext={(options) => {
          localStorage.setItem("haven_user_commute", JSON.stringify(options));
          router.push("/swipe");
        }}
        onBack={() => setView("address")}
        initialOptions={currentCommuteOptions}
      />
    );
  }

  return null;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
