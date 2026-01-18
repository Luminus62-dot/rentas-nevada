
import React from 'react';

type CardProps = {
    children: React.ReactNode;
    className?: string;
};

export function Card({ children, className = "" }: CardProps) {
    return (
        <div className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 ${className}`}>
            {children}
        </div>
    );
}
