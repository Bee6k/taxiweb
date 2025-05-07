"use client";

import type * as React from 'react';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  count?: number;
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  color?: string;
  hoverColor?: string;
  disabled?: boolean;
  className?: string;
}

export function StarRating({
  count = 5,
  value = 0,
  onChange,
  size = 24,
  color = "text-gray-300", // Muted color for unselected stars
  hoverColor = "text-yellow-400", // Accent color for selected/hovered stars
  disabled = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | undefined>(undefined);

  const stars = Array.from({ length: count }, (_, i) => i + 1);

  const handleClick = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(undefined);
    }
  };

  return (
    <div className={cn("flex items-center space-x-1", className)} onMouseLeave={handleMouseLeave}>
      {stars.map((starValue) => {
        const isActive = (hoverValue || value) >= starValue;
        return (
          <Star
            key={starValue}
            size={size}
            className={cn(
              "cursor-pointer transition-colors",
              isActive ? hoverColor : color,
              disabled && "cursor-not-allowed opacity-70"
            )}
            fill={isActive ? "currentColor" : "none"}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
          />
        );
      })}
    </div>
  );
}
