"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { ChevronDown, X, Check } from "lucide-react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  hasUpgrade?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  title?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select",
  title = "Select",
  name,
  disabled = false,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const [ref, bounds] = useMeasure({ offsetSize: true });
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  function choose(next: string) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
    setIsOpen(false);
  }

  const selected = options.find((o) => o.value === current);

  return (
    <div className={cn("relative w-full", className)}>
      {name ? <input type="hidden" name={name} value={current} /> : null}
      <MotionConfig
        transition={{ type: "spring", stiffness: 200, damping: 25, mass: 1 }}
      >
        <motion.div
          ref={containerRef}
          animate={{ height: bounds.height > 0 ? bounds.height : "auto" }}
          className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          style={disabled ? { opacity: 0.55 } : undefined}
        >
          <div ref={ref} className="p-1.5">
            <AnimatePresence mode="popLayout" initial={false}>
              {!isOpen ? (
                <motion.button
                  key="trigger"
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setIsOpen(true)}
                  exit={{ opacity: 0, transition: { duration: 0 } }}
                  className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  {selected?.icon ? (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                      {selected.icon}
                    </span>
                  ) : null}
                  <span className="flex-1 truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {selected ? selected.label : placeholder}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                </motion.button>
              ) : (
                <motion.div
                  key="expanded"
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="flex flex-col gap-2 pt-1"
                >
                  <div className="mb-1 flex items-center justify-between px-2">
                    <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      {title}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close menu"
                      title="Close menu"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {options.map((o) => {
                      const active = o.value === current;
                      return (
                        <motion.button
                          key={o.value}
                          type="button"
                          onClick={() => choose(o.value)}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "group flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
                            active &&
                              "bg-emerald-50/70 dark:bg-emerald-950/30",
                          )}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            {o.icon ? (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                                {o.icon}
                              </span>
                            ) : null}
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold text-zinc-800 dark:text-zinc-100">
                                {o.label}
                              </div>
                              {o.description ? (
                                <div className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                                  {o.description}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {o.hasUpgrade ? (
                              <span className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-700 dark:text-emerald-300">
                                Upgrade
                              </span>
                            ) : (
                              <span
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                                  active
                                    ? "border-emerald-600 bg-emerald-600 dark:border-emerald-400 dark:bg-emerald-400"
                                    : "border-zinc-200 dark:border-zinc-700",
                                )}
                              >
                                <AnimatePresence mode="popLayout" initial={false}>
                                  {active ? (
                                    <motion.span
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Check className="h-4 w-4 stroke-[3.5px] text-white dark:text-emerald-950" />
                                    </motion.span>
                                  ) : null}
                                </AnimatePresence>
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
}
