"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AddressInput from "@/components/AddressInput";
import CommutePreference from "@/components/CommutePreference";

function PreferencesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"address" | "commute">("address");
  const [userAddress, setUserAddress] = useState<string>("");

  useEffect(() => {
    // Check for step query parameter
    const stepParam = searchParams.get("step");
    if (stepParam === "commute") {
      setStep("commute");
    }
    // Load current address from localStorage
    const currentAddress = typeof window !== 'undefined' ? localStorage.getItem("haven_user_address") || "" : "";
    setUserAddress(currentAddress);
  }, [searchParams]);

  const currentAddress = userAddress || (typeof window !== 'undefined' ? localStorage.getItem("haven_user_address") || "" : "");

  if (step === "address") {
    return (
      <AddressInput
        onNext={(address) => {
          setUserAddress(address);
          localStorage.setItem("haven_user_address", address);
          setStep("commute");
        }}
        onBack={() => router.push("/swipe")}
        initialAddress={currentAddress}
      />
    );
  }

  const currentCommuteOptions = typeof window !== 'undefined' 
    ? (localStorage.getItem("haven_user_commute") ? JSON.parse(localStorage.getItem("haven_user_commute")!) : [])
    : [];

  return (
    <CommutePreference
      onNext={(options) => {
        localStorage.setItem("haven_user_commute", JSON.stringify(options));
        router.push("/swipe");
      }}
      onBack={() => setStep("address")}
      initialOptions={currentCommuteOptions}
    />
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreferencesContent />
    </Suspense>
  );
}

