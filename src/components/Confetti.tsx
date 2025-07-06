/**
 * @file 紙吹雪エフェクトコンポーネント
 * @description 習慣達成時などに表示するお祝いのアニメーション
 */

import React, { useEffect, useState } from 'react';

interface ConfettiProps {
  show: boolean;
  particleCount?: number;
  duration?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({ 
  show, 
  particleCount = 50,
  duration = 3000 
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    color: string;
    size: number;
    left: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    if (show) {
      const colors = [
        'hsl(var(--primary))',
        'hsl(var(--secondary))',
        'hsl(var(--accent))',
        'hsl(var(--success))',
        'hsl(var(--warning))',
        'hsl(var(--info))',
      ];

      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: (Math.random() * 1 + 2),
      }));

      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, particleCount, duration]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 10px ${particle.color}`,
            }}
          />
        </div>
      ))}
    </div>
  );
};