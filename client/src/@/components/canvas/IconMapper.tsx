import {
    Wallet,
    TrendingUp,
    PiggyBank,
    Banknote,
    Bitcoin,
    BarChart3,
    Box,
    Rocket,
    LayoutDashboard,
    CreditCard,
    DollarSign,
    Landmark,
    Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const iconMap: Record<string, any> = {
    // Finance related
    'finance': Wallet,
    'investments': TrendingUp,
    'savings': PiggyBank,
    'expenses': Banknote,
    'crypto': Bitcoin,
    'stocks': BarChart3,
    'money': DollarSign,
    'bank': Landmark,
    'coins': Coins,
    'card': CreditCard,

    // General
    'service': Box,
    'rocket': Rocket,
    'dashboard': LayoutDashboard,
};

interface IconDisplayProps {
    name?: string;
    className?: string;
    size?: number;
}

export function IconDisplay({ name, className, size = 20 }: IconDisplayProps) {
    // Default to Box if icon not found or name is empty
    const IconComponent = (name && iconMap[name.toLowerCase()]) || Box;

    // If name is an emoji (simple check), render it as text
    const isEmoji = name && /\p{Extended_Pictographic}/u.test(name);

    if (isEmoji) {
        return (
            <span className={cn("flex items-center justify-center font-emoji", className)} style={{ fontSize: size }}>
                {name}
            </span>
        );
    }

    return <IconComponent className={className} size={size} />;
}
