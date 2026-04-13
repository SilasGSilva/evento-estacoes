"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type PulseCtaLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function PulseCtaLink({ href, label, className }: PulseCtaLinkProps) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.015, 1],
        boxShadow: [
          "0 8px 20px rgba(226,114,91,0.20)",
          "0 10px 24px rgba(226,114,91,0.35)",
          "0 8px 20px rgba(226,114,91,0.20)",
        ],
      }}
      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex rounded-full"
    >
      <Link href={href} className={className}>
        {label}
      </Link>
    </motion.div>
  );
}
