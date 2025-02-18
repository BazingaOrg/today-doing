"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function ConfettiCelebration() {
  useEffect(() => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    let intervalId: NodeJS.Timeout;

    intervalId = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(intervalId);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // 从左侧发射烟花
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: [
          "#FFD700",
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FFEEAD",
        ],
      });

      // 从右侧发射烟花
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: [
          "#FFD700",
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FFEEAD",
        ],
      });
    }, 250);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return null;
}
