"use client";

import { useEffect, useState, type FC } from "react";
import { motion } from "motion/react";
import { IoMoon, IoMoonOutline, IoSunny, IoSunnyOutline } from "react-icons/io5";
import { useTheme } from "next-themes";

interface SwitchModeProps {
  width?: number;
  height?: number;
}

export const SwitchMode: FC<SwitchModeProps> = ({
  width = 76,
  height = 38,
}) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) {
    return <div style={{ width, height }} className="rounded-full border-2 border-transparent" />;
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
        borderColor: isDark ? "#2f4a6b" : "rgba(255,255,255,0.7)",
      }}
    >
      {/* TRACK */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ backgroundColor: isDark ? "#0B1B33" : "#BDE3FB" }}
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
          backgroundColor: isDark ? "#16283F" : "#FFFFFF",
          borderColor: isDark ? "#2f4a6b" : "rgba(255,255,255,0.9)",
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
          <IoSunnyOutline color="#7fb5e6" style={{ width: iconSize, height: iconSize }} />
        ) : (
          <IoSunny color="#1c6fb8" style={{ width: iconSize, height: iconSize }} />
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
          <IoMoon color="#BFDBFE" style={{ width: iconSize, height: iconSize }} />
        ) : (
          <IoMoonOutline color="#4187c3" style={{ width: iconSize, height: iconSize }} />
        )}
      </motion.div>
    </motion.button>
  );
};
