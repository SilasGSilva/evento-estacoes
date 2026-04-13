"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type TimeParts = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

function getRemainingTime(targetDate: Date): TimeParts {
  const now = new Date().getTime();
  const diff = targetDate.getTime() - now;

  if (diff <= 0) {
    return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
  }

  return {
    dias: Math.floor(diff / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diff / (1000 * 60)) % 60),
    segundos: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown() {
  const target = useMemo(() => new Date("2026-08-21T18:00:00-03:00"), []);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [timeLeft, setTimeLeft] = useState<TimeParts>(() => getRemainingTime(target));

  useEffect(() => {
    if (!isMounted) return;

    const intervalId = setInterval(() => {
      setTimeLeft(getRemainingTime(target));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isMounted, target]);

  const items = [
    { label: "Dias", value: timeLeft.dias },
    { label: "Horas", value: timeLeft.horas },
    { label: "Min", value: timeLeft.minutos },
    { label: "Seg", value: timeLeft.segundos },
  ];

  if (!isMounted) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["Dias", "Horas", "Min", "Seg"].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-secondary/40 bg-primary/70 p-4 text-center backdrop-blur-sm"
          >
            <p className="text-3xl font-bold text-secondary">00</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/80">{label}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <motion.div
          key={item.label}
          className="rounded-2xl border border-secondary/40 bg-primary/70 p-4 text-center backdrop-blur-sm"
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <p className="text-3xl font-bold text-secondary">{String(item.value).padStart(2, "0")}</p>
          <p className="mt-1 text-xs uppercase tracking-wider text-white/80">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
