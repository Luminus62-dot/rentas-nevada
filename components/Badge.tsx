
import React from 'react';

type BadgeProps = {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'verified';
    className?: string;
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-300";

    const variants = {
        default: "bg-primary/10 text-primary",
        success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        outline: "border border-border text-muted-foreground",
        verified: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm font-bold scale-105"
    };

    return (
        <span className={`${baseClasses} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}
