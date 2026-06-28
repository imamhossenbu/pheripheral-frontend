import { Users, ShieldCheck, Shield } from "lucide-react";

interface Props {
    totalUsers: number;
    verifiedUsers: number;
    admins: number;
}

export default function UserStats({ totalUsers, verifiedUsers, admins }: Props) {
    const cards = [
        {
            title: "Total Users",
            value: totalUsers,
            icon: Users,
            color: "text-brand-500",
            bg: "bg-brand-50",
            border: "border-brand-100",
        },
        {
            title: "Verified Users",
            value: verifiedUsers,
            icon: ShieldCheck,
            color: "text-success-500",
            bg: "bg-success-50",
            border: "border-success-400/30", 
        },
        {
            title: "Administrators",
            value: admins,
            icon: Shield,
            color: "text-accent-500",
            bg: "bg-info-50",
            border: "border-info-400/30",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.title}
                        className="p-6 bg-surface-0 border border-surface-300 rounded-2xl shadow-sm hover:-translate-y-1 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest">
                                    {card.title}
                                </p>
                                <h2 className="mt-2 text-3xl font-black text-text-primary">
                                    {card.value}
                                </h2>
                            </div>

                            <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${card.bg} ${card.border}`}>
                                <Icon size={24} className={card.color} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}