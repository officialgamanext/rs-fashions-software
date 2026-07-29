'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export const ProgressBar: React.FC = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(70), 150);
    const timer2 = setTimeout(() => setProgress(98), 350);
    const timer3 = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 550);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 h-[3px] bg-black/10 backdrop-blur-2xs pointer-events-none overflow-hidden">
      {/* Pure White Sparkling Progress Line with White Glow */}
      <div
        className="h-full bg-white transition-all duration-300 ease-out shadow-[0_0_10px_#ffffff,0_0_20px_rgba(255,255,255,0.8)] relative"
        style={{ width: `${progress}%` }}
      >
        {/* White Glowing Tip */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#ffffff,0_0_24px_#ffffff] animate-pulse" />
      </div>
    </div>
  );
};
