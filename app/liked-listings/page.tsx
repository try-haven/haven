"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import LikedListings from "@/components/LikedListings";
import { useUser } from "@/contexts/UserContext";
import { useLikedListingsContext } from "@/contexts/LikedListingsContext";
import { useListings } from "@/contexts/ListingsContext";

export default function LikedListingsPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: userLoading } = useUser();
  const { likedIds, likedCount, toggleLike, loading: likedLoading } = useLikedListingsContext();
  const { listings, isLoading: isLoadingListings } = useListings();

  // Wait for ALL contexts to finish loading before rendering
  const isLoading = userLoading || isLoadingListings || likedLoading;

  const likedListings = useMemo(() =>
    listings.filter((listing) => likedIds.has(listing.id)),
    [listings, likedIds]
  );

  // Show loading screen while contexts initialize
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading your liked listings...</div>
      </div>
    );
  }

  const handleRemoveLike = async (listingId: string) => {
    await toggleLike(listingId);

    if (!user) return;

    // Track the removal as a metric event
    const metricsData = localStorage.getItem("haven_listing_metrics");
    const metrics = metricsData ? JSON.parse(metricsData) : {};

    if (!metrics[listingId]) {
      metrics[listingId] = { listingId, views: 0, swipeRights: 0, swipeLefts: 0, shares: 0 };
    }

    // Decrement swipe rights count
    metrics[listingId].swipeRights = Math.max(0, (metrics[listingId].swipeRights || 0) - 1);
    localStorage.setItem("haven_listing_metrics", JSON.stringify(metrics));

    // Store timestamped event for trends (track as an unlike)
    const eventsData = localStorage.getItem("haven_listing_metric_events");
    const events = eventsData ? JSON.parse(eventsData) : [];
    events.push({
      listingId,
      timestamp: Date.now(),
      type: 'unlike',
      userId: user.username
    });
    localStorage.setItem("haven_listing_metric_events", JSON.stringify(events));
  };

  return (
    <LikedListings
      likedListings={likedListings}
      onBack={() => router.push("/swipe")}
      onRemoveLike={handleRemoveLike}
      onBackToHome={() => router.push("/")}
      isLoading={false} // Loading is handled above, component doesn't need to show loading state
      likedCount={likedCount}
    />
  );
}


