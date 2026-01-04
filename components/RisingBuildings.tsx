"use client";

import { motion, MotionValue, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface RisingBuildingsProps {
  scrollYProgress: MotionValue<number>;
}

interface BuildingConfig {
  height: number;
  width: number;
  windows: { rows: number; cols: number };
  startDelay: number;
  scrollRange: [number, number];
  translateY: number;
}

export default function RisingBuildings({ scrollYProgress }: RisingBuildingsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Building configurations - 5 buildings on desktop, 3 on mobile
  const buildingConfigs: BuildingConfig[] = isMobile ? [
    { height: 280, width: 80, windows: { rows: 10, cols: 3 }, startDelay: 0, scrollRange: [0, 0.6], translateY: 350 },
    { height: 380, width: 80, windows: { rows: 14, cols: 3 }, startDelay: 0.1, scrollRange: [0.1, 0.7], translateY: 450 },
    { height: 320, width: 80, windows: { rows: 12, cols: 3 }, startDelay: 0, scrollRange: [0, 0.6], translateY: 400 }
  ] : [
    { height: 300, width: 80, windows: { rows: 11, cols: 3 }, startDelay: 0, scrollRange: [0, 0.6], translateY: 400 },
    { height: 380, width: 80, windows: { rows: 14, cols: 3 }, startDelay: 0.05, scrollRange: [0.05, 0.65], translateY: 450 },
    { height: 450, width: 90, windows: { rows: 17, cols: 3 }, startDelay: 0.1, scrollRange: [0.1, 0.7], translateY: 500 },
    { height: 350, width: 80, windows: { rows: 13, cols: 3 }, startDelay: 0.05, scrollRange: [0.05, 0.65], translateY: 430 },
    { height: 280, width: 75, windows: { rows: 10, cols: 3 }, startDelay: 0, scrollRange: [0, 0.6], translateY: 350 }
  ];

  const Building = ({ config, index }: { config: BuildingConfig; index: number }) => {
    const buildingY = useTransform(
      scrollYProgress,
      config.scrollRange,
      [config.translateY, 0]
    );

    // Generate window positions
    const windows = [];
    const windowWidth = 12;
    const windowHeight = 10;
    const windowSpacingX = (config.width - windowWidth * config.windows.cols) / (config.windows.cols + 1);
    const windowSpacingY = 18;
    const startY = 20;

    for (let row = 0; row < config.windows.rows; row++) {
      for (let col = 0; col < config.windows.cols; col++) {
        windows.push({
          x: windowSpacingX + col * (windowWidth + windowSpacingX),
          y: startY + row * windowSpacingY,
          delay: index * 0.1 + row * 0.05
        });
      }
    }

    return (
      <motion.div
        className="flex-shrink-0"
        style={{
          y: buildingY,
          willChange: "transform"
        }}
      >
        <svg
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="drop-shadow-xl"
          style={{ width: config.width, height: config.height }}
        >
          {/* Main building structure */}
          <rect
            x="0"
            y="0"
            width={config.width}
            height={config.height}
            rx="4"
            className="fill-indigo-500/30 dark:fill-indigo-600/20"
          />

          {/* Roof accent */}
          <rect
            x="0"
            y="0"
            width={config.width}
            height="8"
            rx="4"
            className="fill-indigo-600/40 dark:fill-indigo-500/30"
          />

          {/* Windows */}
          {windows.map((window, i) => (
            <motion.rect
              key={i}
              x={window.x}
              y={window.y}
              width={windowWidth}
              height={windowHeight}
              rx="2"
              className="fill-yellow-200/20 dark:fill-yellow-400/15"
              initial={{ opacity: 0.1 }}
              animate={{
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 3,
                delay: window.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Building outline for depth */}
          <rect
            x="0"
            y="0"
            width={config.width}
            height={config.height}
            rx="4"
            className="fill-none stroke-indigo-700/10 dark:stroke-indigo-400/10"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    );
  };

  return (
    <div className="w-full h-full flex items-end justify-center gap-4 md:gap-8 px-4">
      {buildingConfigs.map((config, index) => (
        <Building key={index} config={config} index={index} />
      ))}
    </div>
  );
}
