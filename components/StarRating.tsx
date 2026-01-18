"use client";

import { useState } from "react";

interface StarRatingProps {
    rating: number; // 0-5
    maxStars?: number;
    size?: "sm" | "md" | "lg";
    readOnly?: boolean;
    onChange?: (rating: number) => void;
    className?: string;
}

export function StarRating({
    rating,
    maxStars = 5,
    size = "md",
    readOnly = false,
    onChange,
    className = ""
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const sizes = {
        sm: "text-sm",
        md: "text-lg",
        lg: "text-2xl"
    };

    return (
        <div className={`flex gap-1 ${className}`}>
            {[...Array(maxStars)].map((_, i) => {
                const starValue = i + 1;
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= starValue;

                return (
                    <button
                        key={i}
                        type="button"
                        className={`${sizes[size]} transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'} ${isFilled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                        onMouseEnter={() => !readOnly && setHoverRating(starValue)}
                        onMouseLeave={() => !readOnly && setHoverRating(null)}
                        onClick={() => !readOnly && onChange?.(starValue)}
                        disabled={readOnly}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
}
