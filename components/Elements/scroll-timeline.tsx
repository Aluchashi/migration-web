"use client";

import { useMemo, useRef } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon } from "@hugeicons/core-free-icons";

export type ChecklistItem = { id: string; label: string; completed: boolean };

export type TimelineEvent = {
  id: string;
  year: string;
  title: string;
  subtitle?: string;
  description?: string;
  checklistItems?: ChecklistItem[];
};

type ScrollTimelineProps = {
  events: TimelineEvent[];
  onToggleItem?: (eventId: string, itemId: string, completed: boolean) => void;
  pendingKeys?: Set<string>;
};

function buildWavePath(count: number): string {
  const n = Math.max(count, 1);
  const mid = 16;
  const amp = 9;
  const seg = 100 / n;
  let d = `M ${mid} 0`;
  for (let i = 0; i < n; i += 1) {
    const y0 = i * seg;
    const y1 = (i + 1) * seg;
    const cy = (y0 + y1) / 2;
    const dir = i % 2 === 0 ? -1 : 1;
    const cx = mid + dir * amp;
    d += ` C ${mid} ${y0 + seg * 0.35}, ${cx} ${cy}, ${mid} ${y1}`;
  }
  return d;
}

export function ScrollTimeline({ events, onToggleItem, pendingKeys }: ScrollTimelineProps) {
  const containerRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.15"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const dashOffset = useTransform(progress, (value) => 1 - value);

  const railPath = useMemo(() => buildWavePath(events.length), [events.length]);

  return (
    <ol ref={containerRef} className="relative space-y-12 pl-20">
      <svg
        className="pointer-events-none absolute left-[1.75rem] top-0 h-full w-10"
        viewBox="0 0 32 100"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          d={railPath}
          pathLength={1}
          className="stroke-zinc-300 dark:stroke-zinc-700"
          strokeWidth={2}
          strokeDasharray="0.015 0.02"
          strokeLinecap="round"
        />
        <motion.path
          d={railPath}
          pathLength={1}
          style={{ strokeDashoffset: dashOffset }}
          className="stroke-emerald-500"
          strokeWidth={2.5}
          strokeDasharray={1}
          strokeLinecap="round"
        />
      </svg>

      {events.map((event) => {
        const items = event.checklistItems ?? [];
        const completedCount = items.filter((item) => item.completed).length;
        const allDone = items.length > 0 && completedCount === items.length;

        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-3xl border border-zinc-200 bg-muted/50 p-6 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900/60">
              <h3 className="mt-1 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-3xl font-bold text-transparent">
                {event.year}
              </h3>
              <p className="mt-1 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{event.title}</p>
              {event.subtitle ? (
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{event.subtitle}</p>
              ) : null}
              {event.description ? (
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{event.description}</p>
              ) : null}

              {items.length > 0 ? (
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Checklist
                    </p>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {completedCount}/{items.length}
                    </p>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {items.map((item) => {
                      const key = `${event.id}::${item.id}`;
                      const pending = pendingKeys?.has(key);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => onToggleItem?.(event.id, item.id, !item.completed)}
                            className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${
                              item.completed
                                ? "border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/40"
                                : "border-zinc-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-emerald-500/40"
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-transform group-active:scale-90 ${
                                item.completed
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-zinc-300 bg-white text-transparent dark:border-zinc-600 dark:bg-zinc-900"
                              }`}
                            >
                              <AnimatePresence>
                                {item.completed ? (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                                  >
                                    <HugeiconsIcon icon={Tick02Icon} className="h-4 w-4" strokeWidth={2.5} />
                                  </motion.span>
                                ) : null}
                              </AnimatePresence>
                            </span>
                            <span
                              className={`text-sm ${
                                item.completed
                                  ? "text-emerald-800 line-through dark:text-emerald-300"
                                  : "text-zinc-700 dark:text-zinc-200"
                              }`}
                            >
                              {item.label}
                            </span>
                            {pending ? (
                              <span className="ml-auto text-xs text-emerald-600">সেভ হচ্ছে…</span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
