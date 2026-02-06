import { cn } from "@/lib/utils";

interface DotGridProps {
    className?: string;
    dotSize?: number;
    gap?: number;
    dotColor?: string;
    backgroundColor?: string;
}

export const DotGrid = ({
    className,
    dotSize = 1,
    gap = 20,
    dotColor = "rgba(255, 255, 255, 0.1)",
    backgroundColor = "transparent",
}: DotGridProps) => {
    return (
        <div
            className={cn("absolute inset-0 -z-10 h-full w-full", className)}
            style={{
                backgroundColor: backgroundColor,
                backgroundImage: `radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
                backgroundSize: `${gap}px ${gap}px`,
            }}
        />
    );
};
