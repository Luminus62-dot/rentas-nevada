import { Card } from "@/components/Card";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: string;
    trendUp?: boolean;
    color?: "blue" | "green" | "purple" | "orange";
}

export function AdminStatCard({ title, value, icon, trend, trendUp, color = "blue" }: StatCardProps) {
    const colorStyles = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
        green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
        purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
        orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    };

    return (
        <Card className="glass border-border/50 p-6 flex items-start justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
                {trend && (
                    <div className={`flex items-center text-xs mt-2 font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
                        <span className="mr-1">{trendUp ? "↑" : "↓"}</span>
                        {trend}
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
                <span className="text-2xl">{icon}</span>
            </div>
        </Card>
    );
}
