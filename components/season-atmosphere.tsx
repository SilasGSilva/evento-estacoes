"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 45 }, (_, index) => {
  const isSecondary = index % 2 === 0;
  return {
    left: `${2 + ((index * 37) % 95)}%`,
    size: 5 + ((index * 7) % 17), // 5..21
    delay: (index * 3) % 15,
    duration: 16 + ((index * 11) % 37), // 16..52
    drift: 8 + ((index * 13) % 40),
    color: isSecondary ? "bg-secondary/75" : "bg-accent/75",
    rotate: 10 + ((index * 19) % 45),
  };
});

export function SeasonAtmosphere() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          className={`absolute top-[-10%] rounded-full ${particle.color}`}
          style={{
            left: particle.left,
            width: particle.size,
            height: Math.round(particle.size * 1.4),
            borderRadius: "60% 40% 60% 40%",
            willChange: "transform",
          }}
          animate={{
            y: ["0vh", "120vh"],
            x: ["0px", `${particle.drift}px`, `${-Math.round(particle.drift * 0.7)}px`, "0px"],
            rotate: [particle.rotate, particle.rotate + 18, particle.rotate - 12, particle.rotate],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
