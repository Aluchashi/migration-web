"use client";

import { useEffect, useState, type FC } from "react";
import { motion } from "motion/react";
import { IoMoon, IoMoonOutline, IoSunny, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "next-themes";

interface SwitchModeProps {
  width?: number;
  height?: number;
  accent?: "emerald" | "purple" | "orange";
}

const palettes = {
  emerald: {
    borderLight: "rgba(255,255,255,0.7)",
    borderDark: "#27574c",
    trackLight: "#bbf7d0",
    trackDark: "#103a31",
    knobLight: "#FFFFFF",
    knobBorderLight: "rgba(255,255,255,0.9)",
    knobDark: "#164e3d",
    knobBorderDark: "#27574c",
    sunLight: "#047857",
    sunDark: "#86efac",
    moonLight: "#059669",
    moonDark: "#d1fae5",
  },
  purple: {
    borderLight: "rgba(255,255,255,0.7)",
    borderDark: "#581c87",
    trackLight: "#e9d5ff",
    trackDark: "#2e1065",
    knobLight: "#FFFFFF",
    knobBorderLight: "rgba(255,255,255,0.9)",
    knobDark: "#6b21a8",
    knobBorderDark: "#581c87",
    sunLight: "#6b21a8",
    sunDark: "#d8b4fe",
    moonLight: "#7e22ce",
    moonDark: "#f3e8ff",
  },
  orange: {
    borderLight: "rgba(255,255,255,0.7)",
    borderDark: "#9a3412",
    trackLight: "#fed7aa",
    trackDark: "#7c2d12",
    knobLight: "#FFFFFF",
    knobBorderLight: "rgba(255,255,255,0.9)",
    knobDark: "#c2410c",
    knobBorderDark: "#9a3412",
    sunLight: "#c2410c",
    sunDark: "#fdba74",
    moonLight: "#ea580c",
    moonDark: "#ffedd5",
  },
} as const;

export const SwitchMode: FC<SwitchModeProps> = ({
  width = 76,
  height = 38,
  accent = "emerald",
}) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const p = palettes[accent];

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ width, height }}
        className="rounded-full border-2 border-transparent"
      />
    );
  }

  const isDark = resolvedTheme === "dark";
  const iconSize = height * 0.45;

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="relative flex items-center rounded-full border-2 transition-colors"
      style={{
        width,
        height,
        borderColor: isDark ? p.borderDark : p.borderLight,
      }}
    >
      {/* TRACK */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ backgroundColor: isDark ? p.trackDark : p.trackLight }}
        transition={{ duration: 0.4 }}
      />

      {/* SLIDING KNOB */}
      <motion.div
        layout
        layoutId="switch-knob"
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="absolute z-30 rounded-full border-2"
        style={{
          width: height,
          height,
          right: isDark ? -2 : undefined,
          left: isDark ? undefined : -2,
          backgroundColor: isDark ? p.knobDark : p.knobLight,
          borderColor: isDark ? p.knobBorderDark : p.knobBorderLight,
        }}
      />

      {/* SUN */}
      <motion.div
        className="relative z-30 flex items-center justify-center"
        style={{ width: height, height }}
        animate={{ rotate: isDark ? 45 : 0 }}
        transition={{ stiffness: 20 }}
      >
        {isDark ? (
          <IoSunnyOutline
            color={p.sunDark}
            style={{ width: iconSize, height: iconSize }}
          />
        ) : (
          <IoSunny
            color={p.sunLight}
            style={{ width: iconSize, height: iconSize }}
          />
        )}
      </motion.div>

      {/* MOON */}
      <motion.div
        className="relative z-30 flex items-center justify-center"
        style={{ width: height, height }}
        animate={{ rotate: isDark ? 0 : 15 }}
        transition={{ stiffness: 20, damping: 14 }}
      >
        {isDark ? (
          <IoMoon
            color={p.moonDark}
            style={{ width: iconSize, height: iconSize }}
          />
        ) : (
          <IoMoonOutline
            color={p.moonLight}
            style={{ width: iconSize, height: iconSize }}
          />
        )}
      </motion.div>
    </motion.button>
  );
};
