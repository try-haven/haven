"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { textStyles, buttonStyles, containerStyles, layoutStyles } from "@/lib/styles";

type CommuteOption = "car" | "public-transit" | "walk" | "bike";

interface CommutePreferenceProps {
  onNext: (commuteOptions: CommuteOption[]) => void;
  onBack?: () => void;
  initialOptions?: CommuteOption[];
}

export default function CommutePreference({ onNext, onBack, initialOptions }: CommutePreferenceProps) {
  const [selectedOptions, setSelectedOptions] = useState<CommuteOption[]>(initialOptions || []);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newOptions, setNewOptions] = useState<CommuteOption[]>([]);

  const toggleOption = (option: CommuteOption) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleNext = () => {
    if (selectedOptions.length > 0) {
      if (initialOptions && JSON.stringify(selectedOptions.sort()) !== JSON.stringify(initialOptions.sort())) {
        setNewOptions(selectedOptions);
        setShowConfirm(true);
      } else {
        onNext(selectedOptions);
      }
    }
  };

  const handleConfirm = () => {
    onNext(newOptions);
    setShowConfirm(false);
  };

  const options: { value: CommuteOption; label: string }[] = [
    { value: "car", label: "Car" },
    { value: "public-transit", label: "Public Transit" },
    { value: "walk", label: "Walk" },
    { value: "bike", label: "Bike" },
  ];

  return (
    <div className={`${containerStyles.pageIndigo} ${layoutStyles.flexColCenter} px-6`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <h2 className={`${textStyles.headingSmall} text-center mb-4`}>
          How do you plan to commute?
        </h2>
        {initialOptions && initialOptions.length > 0 && (
          <p className={`${textStyles.bodyCenter} mb-6`}>
            Current: {initialOptions.map(o => options.find(opt => opt.value === o)?.label).join(", ")}
          </p>
        )}

        {/* Options */}
        <div className={`${layoutStyles.spaceY4} mb-8`}>
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`${buttonStyles.option} ${
                  isSelected ? buttonStyles.optionSelected : buttonStyles.optionUnselected
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className={containerStyles.dialogOverlay}>
            <div className={containerStyles.dialog}>
              <h3 className={`${textStyles.headingSmall} mb-4`}>Confirm Changes</h3>
              <div className="mb-4">
                <p className={`${textStyles.bodySmall} mb-2`}>Current:</p>
                <p className={textStyles.heading}>{initialOptions?.map(o => options.find(opt => opt.value === o)?.label).join(", ") || "None"}</p>
                <p className={`${textStyles.bodySmall} mb-2 mt-4`}>New:</p>
                <p className={textStyles.heading}>{newOptions.map(o => options.find(opt => opt.value === o)?.label).join(", ")}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                    setSelectedOptions(initialOptions || []);
                  }}
                  className={buttonStyles.secondaryCancel}
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className={buttonStyles.primaryConfirm}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className={buttonStyles.backTextDark}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selectedOptions.length === 0}
            className={buttonStyles.primaryAction}
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}

