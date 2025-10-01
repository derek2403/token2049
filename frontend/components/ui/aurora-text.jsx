"use client"

import React, { memo } from "react"

/**
 * AuroraText Component
 * Creates a beautiful animated text effect with gradient colors
 * 
 * @param {ReactNode} children - The text content to display
 * @param {string} className - Additional CSS classes
 * @param {string[]} colors - Array of colors for the gradient effect
 * @param {number} speed - Animation speed multiplier (default: 1)
 */
export const AuroraText = memo(
  ({
    children,
    className = "",
    colors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"],
    speed = 1,
  }) => {
    // Create gradient style with custom colors and animation speed
    const gradientStyle = {
      backgroundImage: `linear-gradient(90deg, ${colors.join(", ")}, ${
        colors[0]
      })`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animationDuration: `${10 / speed}s`,
    }

    return (
      <span className={`relative inline-block ${className}`}>
        {/* Screen reader text */}
        <span className="sr-only">{children}</span>
        {/* Animated aurora text with glow effect */}
        <span
          className="animate-aurora relative bg-[length:400%_auto] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    )
  }
)

AuroraText.displayName = "AuroraText"

