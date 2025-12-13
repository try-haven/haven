"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ReviewedListings from "@/components/ReviewedListings";
import { useLikedListingsContext } from "@/contexts/LikedListingsContext";
import { useUser } from "@/contexts/UserContext";

export default function MyReviewsPage() {
  const router = useRouter();
  const { isLoggedIn, loading } = useUser();
  const { likedCount } = useLikedListingsContext();

  // Redirect to home page if user logs out (but not during initial load)
  useEffect(() => {
    if (!isLoggedIn && !loading) {
      router.push("/");
    }
  }, [isLoggedIn, loading, router]);

  return (
    <ReviewedListings
      onBack={() => router.push("/swipe")}
      onBackToHome={() => router.push("/")}
      likedCount={likedCount}
    />
  );
}


