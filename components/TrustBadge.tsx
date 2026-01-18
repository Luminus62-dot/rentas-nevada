import { Badge } from "@/components/Badge";

interface TrustSettings {
    score: number;
    label: string;
    color: string;
    icon: string;
}

export function getTrustLevel(score: number): TrustSettings {
    if (score >= 90) return { score, label: "Elite Landlord", color: "text-purple-600 bg-purple-50 border-purple-200", icon: "💎" };
    if (score >= 80) return { score, label: "Muy Confiable", color: "text-green-600 bg-green-50 border-green-200", icon: "🛡️" };
    if (score >= 60) return { score, label: "Verificado", color: "text-blue-600 bg-blue-50 border-blue-200", icon: "✅" };
    return { score, label: "Miembro", color: "text-gray-600 bg-gray-50 border-gray-200", icon: "👤" };
}

export function TrustBadge({ score, size = "md" }: { score: number, size?: "sm" | "md" | "lg" }) {
    const { label, color, icon } = getTrustLevel(score);

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-2"
    };

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border ${color} ${sizeClasses[size]} font-medium transition-all hover:shadow-md cursor-help`} title={`Trust Score: ${score}/100`}>
            <span>{icon}</span>
            <span>{label}</span>
            {size !== 'sm' && <span className="ml-1 opacity-70 text-[0.8em]">({score})</span>}
        </div>
    );
}
