"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import DarkModeToggle from "./DarkModeToggle";
import HavenLogo from "./HavenLogo";
import { textStyles, buttonStyles, containerStyles, layoutStyles } from "@/lib/styles";

// Lazy load animation components for better performance
const AnimatedBackground = dynamic(() => import("./AnimatedBackground"), {
  ssr: false
});

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  // Scroll tracking refs
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Scroll progress tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Scroll state for navigation
  const [scrolled, setScrolled] = useState(false);

  // Accessibility - detect prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const duration = prefersReducedMotion ? 0.01 : 0.6;

  return (
    <div ref={containerRef} className="relative">
      {/* Animated Background */}
      <AnimatedBackground scrollYProgress={scrollYProgress} />

      {/* Navigation - Scroll-aware */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className={layoutStyles.flexBetween}>
          <div className={layoutStyles.flexGap}>
            <HavenLogo size="sm" showAnimation={false} />
            <div className={textStyles.headingBrandSmall}>Haven</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="#features"
              className={`${buttonStyles.nav} hidden sm:block`}
            >
              Features
            </Link>
            <Link
              href="#about"
              className={`${buttonStyles.nav} hidden sm:block`}
            >
              About
            </Link>
            <DarkModeToggle />
            <button
              onClick={onGetStarted}
              className={`${buttonStyles.navBordered} text-sm sm:text-base px-3 sm:px-4`}
            >
              Get Started
            </button>
          </div>
        </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div ref={heroRef} className={`${layoutStyles.containerHero} pt-32 relative z-10`}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease: "easeOut" }}
          >
            <span className={textStyles.heading}>Your Next</span>
            <span className={`block ${textStyles.brand}`}>Home Awaits</span>
          </motion.h1>

          <motion.p
            className={textStyles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            Find your perfect apartment or showcase your property to qualified renters. Haven makes apartment hunting and listing simple.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
          >
            <motion.button
              onClick={onGetStarted}
              className={buttonStyles.primary}
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Get Started
            </motion.button>
          </motion.div>
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration, delay: prefersReducedMotion ? 0 : 0.5 }}
          >
            Whether you're searching for an apartment or listing one, Haven has you covered
          </motion.p>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div
          ref={featuresRef}
          id="features"
          className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {[
            {
              icon: "🏠",
              title: "For Renters",
              description: "Swipe through personalized listings, save favorites, and leave reviews to help others."
            },
            {
              icon: "🏢",
              title: "For Managers",
              description: "List verified properties and track real-time metrics on views, likes, and engagement."
            },
            {
              icon: "📊",
              title: "Data-Driven Insights",
              description: "Managers see detailed analytics while renters get personalized recommendations."
            }
          ].map((feature, index) => {
            const cardRef = useRef<HTMLDivElement>(null);
            const isInView = useInView(cardRef, { once: true, amount: 0.3 });
            const [isHovered, setIsHovered] = useState(false);

            return (
              <motion.div
                key={index}
                ref={cardRef}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{
                  duration: 0.5,
                  delay: prefersReducedMotion ? 0 : index * 0.12,
                  ease: "easeOut"
                }}
                whileHover={prefersReducedMotion ? {} : {
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <motion.div
                  className="text-5xl mb-4"
                  animate={!prefersReducedMotion && isHovered ? {
                    scale: 1.1,
                    rotate: [0, -5, 5, 0]
                  } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* About Section */}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          id="about"
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration, delay: prefersReducedMotion ? 0 : 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            One Platform, Two Perspectives
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Haven connects apartment seekers with property managers through an intuitive, modern platform.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Renters swipe through personalized listings and leave reviews. Managers showcase properties
            and track engagement metrics. Everyone finds what they're looking for.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20 py-8">
        <div className="container mx-auto px-6 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Haven.</p>
        </div>
      </footer>
    </div>
  );
}


