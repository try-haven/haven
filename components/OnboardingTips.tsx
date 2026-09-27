"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "haven_onboarding_shown";

const tips = [
  {
    icon: "👆",
    title: "Swipe to browse",
    description: "Drag a card left to pass, right to like. On desktop, use the ← → arrow keys.",
  },
  {
    icon: "❤️",
    title: "Save listings you love",
    description: "Swipe right or tap the heart to save a listing. Find everything you've liked in the Liked tab.",
  },
  {
    icon: "⭐",
    title: "Leave a review",
    description: "Open any saved listing and tap \"Write a Review\" to rate it and leave a note.",
  },
  {
    icon: "🔗",
    title: "Share a listing",
    description: "Tap the share icon on any card or listing detail page to send it to a friend.",
  },
  {
    icon: "⚙️",
    title: "Update your preferences",
    description: "Tap your profile icon at any time to update your budget, neighborhoods, amenities, and more.",
  },
];

interface OnboardingTipsProps {
  isNewUser: boolean;
}

export default function OnboardingTips({ isNewUser }: OnboardingTipsProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isNewUser) return;
    const already = localStorage.getItem(STORAGE_KEY);
    if (!already) setVisible(true);
  }, [isNewUser]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const next = () => {
    if (step < tips.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-7 flex flex-col items-center text-center"
          >
            <div className="text-5xl mb-4">{tips[step].icon}</div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {tips[step].title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {tips[step].description}
            </p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-6">
              {tips.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === step
                      ? "w-4 bg-indigo-500"
                      : "w-1.5 bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={dismiss}
                className="flex-1 px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={next}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {step < tips.length - 1 ? "Next" : "Got it!"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
