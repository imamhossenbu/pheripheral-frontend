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
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-950/20",
            border: "border-orange-100 dark:border-orange-900/30",
        },
        {
            title: "Verified Users",
            value: verifiedUsers,
            icon: ShieldCheck,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-950/20",
            border: "border-amber-100 dark:border-amber-900/30",
        },
        {
            title: "Administrators",
            value: admins,
            icon: Shield,
            color: "text-deep-orange-500 text-orange-600",
            bg: "bg-orange-100/50 dark:bg-orange-900/10",
            border: "border-orange-200/60 dark:border-orange-800/20",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.title}
                        className="p-6 bg-white  border border-gray-100  rounded-2xl shadow-sm hover:-translate-y-1 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                    {card.title}
                                </p>
                                <h2 className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
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