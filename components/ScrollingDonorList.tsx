"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Heart } from "lucide-react";

interface Donor {
  name: string;
  amount: number;
  isAnonymous: boolean;
  date: string;
}

interface ScrollingDonorListProps {
  donors: Donor[];
}

const SCROLL_SPEED = 20; // px/s

export default function ScrollingDonorList({ donors }: ScrollingDonorListProps) {
  const safeDonors = useMemo(
    () => (Array.isArray(donors) ? donors : []),
    [donors]
  );

  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || safeDonors.length === 0) return;

    // Wait one frame so DOM has rendered and scrollHeight is accurate
    const startRaf = requestAnimationFrame(() => {
      const halfHeight = el.scrollHeight / 2;
      if (halfHeight <= el.clientHeight) return;

      const tick = (time: number) => {
        if (lastTimeRef.current === null) lastTimeRef.current = time;
        const delta = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        if (!isPaused) {
          posRef.current += SCROLL_SPEED * delta;
          // Seamless reset at halfway — back to start of original list
          if (posRef.current >= halfHeight) {
            posRef.current -= halfHeight;
          }
          el.scrollTop = posRef.current;
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(startRaf);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [safeDonors, isPaused]);

  if (safeDonors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Heart className="w-8 h-8 mx-auto mb-2 text-brand_secondary" />
        <p className="text-sm">No donors yet</p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        ref={containerRef}
        className="h-64 overflow-hidden"
        style={{ cursor: isPaused ? "grab" : "default" }}
      >
        <div className="py-3 space-y-2">
          {/* Original list */}
          {safeDonors.map((donor, index) => (
            <div
              key={index}
              className="flex justify-between items-center px-6 py-3 shadow-md"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand_secondary flex-shrink-0" />
                <span className="font-medium text-gray-800 text-sm truncate">
                  {donor.name}
                </span>
              </div>
              <span className="font-semibold text-gray-600 text-sm">
                {donor.amount.toLocaleString("nb-NO", {
                  style: "currency",
                  currency: "NOK",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          ))}
          {/* Duplicate for seamless infinite loop */}
          {safeDonors.map((donor, index) => (
            <div
              key={`dup-${index}`}
              className="flex justify-between items-center px-6 py-3 shadow-md"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand_secondary flex-shrink-0" />
                <span className="font-medium text-gray-800 text-sm truncate">
                  {donor.name}
                </span>
              </div>
              <span className="font-semibold text-gray-600 text-sm">
                {donor.amount.toLocaleString("nb-NO", {
                  style: "currency",
                  currency: "NOK",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}