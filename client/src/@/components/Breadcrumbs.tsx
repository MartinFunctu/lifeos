import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
    id: string;
    label: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    onNavigate: (id: string, index: number) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#1C1926] border border-[#4A4955] rounded-full w-fit mb-4 shadow-lg backdrop-blur-md">
            <button
                onClick={() => onNavigate('root', -1)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
            >
                <Home size={16} />
            </button>

            {items.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <ChevronRight size={14} className="text-white/30" />
                    <button
                        onClick={() => onNavigate(item.id, index)}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-white",
                            index === items.length - 1
                                ? "text-white cursor-default pointer-events-none"
                                : "text-white/60"
                        )}
                    >
                        {item.label}
                    </button>
                </div>
            ))}
        </div>
    );
}
