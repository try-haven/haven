"use client";

import { motion, useMotionValue, useTransform, PanInfo, animate } from "framer-motion";
import { useState, useEffect } from "react";
import { ApartmentListing } from "@/lib/data";
import Image from "next/image";

interface SwipeableCardProps {
  listing: ApartmentListing;
  onSwipe: (direction: "left" | "right") => void;
  index: number;
  total: number;
  triggerSwipe?: "left" | "right" | null;
  isTriggeredCard?: boolean;
}

export default function SwipeableCard({
  listing,
  onSwipe,
  index,
  total,
  triggerSwipe,
  isTriggeredCard = false,
}: SwipeableCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [pendingSwipe, setPendingSwipe] = useState<"left" | "right" | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  // Swipe direction indicators
  const likeOpacity = useTransform(x, [0, 200], [0, 1]);
  const nopeOpacity = useTransform(x, [-200, 0], [1, 0]);

  // Trigger swipe animation when triggerSwipe prop changes
  useEffect(() => {
    if (triggerSwipe && isTriggeredCard && !hasTriggered && exitX === 0) {
      const direction = triggerSwipe === "right" ? 200 : -200;
      setHasTriggered(true);
      setExitX(direction);
      setPendingSwipe(triggerSwipe);
      // Animate the x motion value smoothly
      animate(x, direction, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
      // Call onSwipe early so state updates happen in parallel with animation
      // This allows the next card to start scaling up while current card animates out
      // Small delay ensures animation has started before state updates
      setTimeout(() => {
        onSwipe(triggerSwipe);
      }, 50); // Reduced delay for faster state updates
    }
  }, [triggerSwipe, isTriggeredCard, onSwipe, x, exitX, hasTriggered]);

  // Reset hasTriggered when card changes
  useEffect(() => {
    if (index !== 0) {
      setHasTriggered(false);
      setExitX(0);
      x.set(0);
      setImageIndex(0);
      setImageError(false);
      setPendingSwipe(null);
    }
  }, [index, x]);

  // Reset image error when image index changes
  useEffect(() => {
    setImageError(false);
  }, [imageIndex]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200);
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  if (index >= total) return null;

  // Scale and offset for cards behind the top card
  const scale = index === 0 ? 1 : 0.95;
  const yOffset = index === 0 ? 0 : 8;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{
        x,
        rotate,
        opacity,
        zIndex: total - index,
        pointerEvents: index === 0 ? "auto" : "none",
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{
        x: exitX,
        opacity: exitX !== 0 ? 0 : 1,
        scale: scale,
        y: yOffset,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      onAnimationComplete={() => {
        // Clear pending swipe after animation completes
        if (pendingSwipe) {
          setPendingSwipe(null);
        }
      }}
      initial={false}
    >
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Image Carousel */}
          <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
            {!imageError && listing.images[imageIndex] ? (
              <Image
                src={listing.images[imageIndex]}
                alt={listing.title}
                fill
                className="object-cover"
                priority={index === 0}
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900">
                <div className="text-center p-8">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-indigo-400 dark:text-indigo-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    {listing.title}
                  </p>
                </div>
              </div>
            )}
            
            {/* Image Indicators */}
            {listing.images.length > 1 && (
              <>
                <div className="absolute top-4 left-4 right-4 flex gap-2">
                  {listing.images.map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full ${
                        i === imageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Swipe Direction Overlays */}
            {index === 0 && (
              <>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ opacity: likeOpacity }}
                >
                  <div className="px-8 py-4 bg-green-500/90 text-white rounded-full text-4xl font-bold border-4 border-white shadow-2xl">
                    LIKE
                  </div>
                </motion.div>
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ opacity: nopeOpacity }}
                >
                  <div className="px-8 py-4 bg-red-500/90 text-white rounded-full text-4xl font-bold border-4 border-white shadow-2xl">
                    NOPE
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{listing.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{listing.address}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${listing.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">/month</div>
              </div>
            </div>

            <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
              <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{listing.bathrooms} bath{listing.bathrooms !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{listing.sqft.toLocaleString()} sqft</span>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{listing.description}</p>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {listing.amenities.slice(0, 4).map((amenity, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
              {listing.amenities.length > 4 && (
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                  +{listing.amenities.length - 4} more
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Available from {new Date(listing.availableFrom).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

