import { memo } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
    Plus,
    Minus,
    Maximize,
    Undo2,
    Redo2,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ControlGroup = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col bg-[#1C1926]/80 backdrop-blur-md border border-[#4A4955] rounded-xl overflow-hidden shadow-2xl mb-4 last:mb-0">
        {children}
    </div>
);

const ControlButton = ({
    onClick,
    icon: Icon,
    title,
    disabled = false
}: {
    onClick?: () => void;
    icon: any;
    title?: string;
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={cn(
            "p-3 text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all outline-none",
            "border-b border-[#4A4955] last:border-b-0",
            disabled && "opacity-30 cursor-not-allowed"
        )}
    >
        <Icon size={20} />
    </button>
);

const CanvasControls = memo(() => {
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    return (
        <div className="absolute top-4 left-4 z-50 flex flex-col scale-[1.1] origin-top-left transition-transform duration-300">
            {/* Group 1: Menu/Grid */}
            <ControlGroup>
                <ControlButton icon={LayoutGrid} title="Menu" />
            </ControlGroup>

            {/* Group 2: Navigation */}
            <ControlGroup>
                <ControlButton onClick={() => zoomIn()} icon={Plus} title="Zoom In" />
                <ControlButton onClick={() => zoomOut()} icon={Minus} title="Zoom Out" />
                <ControlButton onClick={() => fitView()} icon={Maximize} title="Fit View" />
            </ControlGroup>

            {/* Group 3: History */}
            <ControlGroup>
                <ControlButton icon={Undo2} title="Undo" disabled />
                <ControlButton icon={Redo2} title="Redo" disabled />
            </ControlGroup>
        </div>
    );
});

export default CanvasControls;
