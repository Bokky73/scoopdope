'use client';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  readOnly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({ value, readOnly = false, onRatingChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const display = readOnly ? value : (hovered || value);

  if (readOnly) {
    return (
      <span className="flex gap-0.5" aria-label={`Rating: ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= value ? 'text-yellow-400' : 'text-gray-300'}
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="flex gap-0.5" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Rate ${star} out of 5`}
          className={`text-2xl transition-colors ${star <= display ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRatingChange?.(star)}
        >
          ★
        </button>
      ))}
    </span>
  );
}
