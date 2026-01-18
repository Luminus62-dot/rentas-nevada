"use client";

import { useEffect, useState } from "react";

export function InteractiveBackground() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div
                className="absolute w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] transition-transform duration-100 ease-out"
                style={{
                    transform: `translate(${mousePosition.x - 300}px, ${mousePosition.y - 300}px)`,
                }}
            />
        </div>
    );
}
