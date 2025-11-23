"use client";

import { useRouter } from "next/navigation";
import ReviewedListings from "@/components/ReviewedListings";

export default function MyReviewsPage() {
  const router = useRouter();

  return (
    <ReviewedListings
      onBack={() => router.push("/swipe")}
      onBackToHome={() => router.push("/")}
    />
  );
}


