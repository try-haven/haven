"use client";

import { useState } from "react";
import { textStyles, buttonStyles, containerStyles, layoutStyles } from "@/lib/styles";

interface AdOverlayProps {
    position?: "bottom-left" | "bottom-right";
}

export default function AdOverlay({ position = "bottom-right" }: AdOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div
            className={position === "bottom-right" ? layoutStyles.fixedBottomRight : layoutStyles.fixedBottomLeft}
        >
            <div className={`${containerStyles.cardSmall} p-3 max-w-[200px]`}>
                <button
                    onClick={() => setIsVisible(false)}
                    className={buttonStyles.iconClose}
                    aria-label="Close ad"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className={textStyles.helperSmall}>Ad</div>
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded p-2 mb-2">
                    <div className={`${textStyles.bodySmall} font-semibold mb-1`}>
                        Moving Services
                    </div>
                    <div className={textStyles.helper}>
                        Get 20% off your first move
                    </div>
                </div>
                <button className={buttonStyles.primarySmall}>
                    Learn More
                </button>
            </div>
        </div>
    );
}

