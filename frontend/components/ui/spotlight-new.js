"use client";
import React from "react";
import { motion } from "motion/react";

/**
 * Spotlight New Component
 * A new spotlight component with left and right spotlight effects
 * Features animated gradients that move horizontally with configurable properties
 * Creates a subtle yet effective background lighting effect
 */
export const Spotlight = ({
  // Gradient colors for the spotlight effects - using softer white/gray tones
  // Lower alpha values reduce perceived brightness on dark backgrounds
  gradientFirst = "radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 95%, .04) 0, hsla(0, 0%, 85%, .015) 50%, hsla(0, 0%, 75%, 0) 80%)",
  gradientSecond = "radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 95%, .03) 0, hsla(0, 0%, 85%, .01) 80%, transparent 100%)",
  gradientThird = "radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 95%, .02) 0, hsla(0, 0%, 80%, .008) 80%, transparent 100%)",
  // Vertical translation offset
  translateY = -350,
  // Dimensions for spotlight elements
  width = 560,
  height = 1380,
  smallWidth = 240,
  // Animation settings
  duration = 7,
  xOffset = 100,
} = {}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 1.5,
      }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {/* Left Spotlight - Moves right and left */}
      <motion.div
        animate={{
          x: [0, xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 left-0 w-screen h-screen z-0 pointer-events-none"
      >
        {/* Main left gradient */}
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(-45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0`}
        />

        {/* Secondary left gradient */}
        <div
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />

        {/* Tertiary left gradient */}
        <div
          style={{
            transform: "rotate(-45deg) translate(-180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 left-0 origin-top-left`}
        />
      </motion.div>

      {/* Right Spotlight - Moves left and right */}
      <motion.div
        animate={{
          x: [0, -xOffset, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="absolute top-0 right-0 w-screen h-screen z-0 pointer-events-none"
      >
        {/* Main right gradient */}
        <div
          style={{
            transform: `translateY(${translateY}px) rotate(45deg)`,
            background: gradientFirst,
            width: `${width}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0`}
        />

        {/* Secondary right gradient */}
        <div
          style={{
            transform: "rotate(45deg) translate(-5%, -50%)",
            background: gradientSecond,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />

        {/* Tertiary right gradient */}
        <div
          style={{
            transform: "rotate(45deg) translate(180%, -70%)",
            background: gradientThird,
            width: `${smallWidth}px`,
            height: `${height}px`,
          }}
          className={`absolute top-0 right-0 origin-top-right`}
        />
      </motion.div>
    </motion.div>
  );
};

