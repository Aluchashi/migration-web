"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons";
import { motion, type Variants } from "motion/react";

import { BrandLogo } from "@/components/Elements/brand-logo";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const riseItem: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.6, bounce: 0 },
  },
};

const giantTextVariant: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", duration: 0.8, bounce: 0 },
  },
};

export interface Footer20Props {
  brandName?: string;
  description?: string;
  email?: string;
  links?: {
    good: { label: string; href: string }[];
    boring: { label: string; href: string }[];
    cool: { label: string; href: string; icon?: React.ReactNode }[];
  };
}

export default function Footer20({
  brandName = "Porizayi",
  description = "Plan your career, build your skills, and move abroad with clear, trustworthy migration guidance.",
  email = "hello@porizayi.com",
  links = {
    good: [
      { label: "Home", href: "#" },
      { label: "Manifesto", href: "#" },
      { label: "Research", href: "#" },
      { label: "Careers", href: "#" },
    ],
    boring: [
      { label: "Terms", href: "#" },
      { label: "Play by the Rules", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Help", href: "#" },
    ],
    cool: [
      { label: "LinkedIn", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
}: Footer20Props) {
  return (
    <motion.footer
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className="relative w-full bg-[#f4f4f2] dark:bg-[#0a0a0a] text-neutral-600 dark:text-neutral-400 font-sans overflow-hidden flex flex-col justify-between transition-colors duration-300 border-t border-neutral-200 dark:border-neutral-800"
    >
      {/* Main content wrapper with dashed borders */}
      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-12 lg:px-16 pt-20 md:pt-32 flex flex-col border-x border-dashed border-neutral-300 dark:border-neutral-800">
        {/* Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-10 md:mb-16 lg:mb-24">
          {/* Left Column (Brand info) */}
          <motion.div
            variants={riseItem}
            className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 md:gap-4"
          >
            {/* Logo */}
            <div className="flex flex-col items-start gap-[1.25rem] text-neutral-900 dark:text-neutral-100">
              <BrandLogo className="h-8 w-auto" />
              <span className="font-medium tracking-wide text-lg">
                {brandName}
              </span>
            </div>

            {/* Description */}
            <p className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-[320px]">
              {description}
            </p>

            {/* Email */}
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 text-[17px] text-neutral-800 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors group mt-2"
            >
              {email}
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={18}
                className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
              />
            </a>
          </motion.div>

          {/* Right Columns (Links) */}
          <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-8">
            {/* The Good */}
            <motion.div variants={riseItem} className="flex flex-col gap-6">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                The Good
              </h4>
              <ul className="flex flex-col gap-3">
                {links.good.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[15px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* The Boring */}
            <motion.div variants={riseItem} className="flex flex-col gap-6">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                The Boring
              </h4>
              <ul className="flex flex-col gap-3">
                {links.boring.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[15px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* The Cool */}
            <motion.div variants={riseItem} className="flex flex-col gap-6">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                The Cool
              </h4>
              <ul className="flex flex-col gap-3">
                {links.cool.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-[15px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Giant Text SVG */}
        <motion.div
          variants={giantTextVariant}
          className="w-full flex justify-center md:mt-auto pb-0"
        >
          <svg
            className="w-full h-auto select-none transition-colors duration-300"
            viewBox={`0 30 ${Math.max(brandName.length * 80, 400)} 80`}
            preserveAspectRatio="xMidYMid meet"
            aria-label={brandName}
          >
            <defs>
              <linearGradient
                id="watermark-gradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  className="[stop-color:#FFDEE3] dark:[stop-color:#333333]"
                />
                <stop
                  offset="25%"
                  className="[stop-color:#FFDEE3] dark:[stop-color:#2A2A2A]"
                />
                <stop
                  offset="50%"
                  className="[stop-color:#E6D3F5] dark:[stop-color:#1A1A1A]"
                />
                <stop
                  offset="75%"
                  className="[stop-color:#FFEBEE] dark:[stop-color:#101010]"
                />
                <stop
                  offset="100%"
                  className="[stop-color:#E7D6F3] dark:[stop-color:#0A0A0A]"
                />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="130"
              dominantBaseline="alphabetic"
              textAnchor="start"
              textLength="100%"
              lengthAdjust="spacing"
              fill="url(#watermark-gradient)"
              className="font-semibold tracking-tighter"
              fontSize="140"
            >
              {brandName}
            </text>
          </svg>
        </motion.div>
      </div>
    </motion.footer>
  );
}
