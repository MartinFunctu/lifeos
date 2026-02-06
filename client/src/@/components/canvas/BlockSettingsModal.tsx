import { useEffect, useState } from 'react';
import { type Node } from '@xyflow/react';
import { type ServiceNodeData } from './CanvasNode';
import { motion, useDragControls } from 'framer-motion';
import { persistStore } from 'stores/persistStore';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface BlockSettingsModalProps {
    node: Node<ServiceNodeData> | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function BlockSettingsModal({ node, open, onOpenChange }: BlockSettingsModalProps) {
    const { modalConfig, setModalConfig } = persistStore();
    const dragControls = useDragControls();

    // Default size: 80% of window or fallback
    const defaultWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 800;
    const defaultHeight = typeof window !== 'undefined' ? window.innerHeight * 0.8 : 600;

    const [position, setPosition] = useState({
        x: modalConfig?.x ?? (typeof window !== 'undefined' ? (window.innerWidth - defaultWidth) / 2 : 100),
        y: modalConfig?.y ?? (typeof window !== 'undefined' ? (window.innerHeight - defaultHeight) / 2 : 100)
    });

    const [size, setSize] = useState({
        width: modalConfig?.width ?? defaultWidth,
        height: modalConfig?.height ?? defaultHeight
    });

    // Helper to get window boundaries
    const getBoundaries = () => {
        if (typeof window === 'undefined') return { width: 0, height: 0 };
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    };

    const TOP_OFFSET = 80; // Distance to clear the top menu/header

    const clampPosition = (x: number, y: number, w: number, h: number) => {
        const { width: windowW, height: windowH } = getBoundaries();
        return {
            x: Math.max(0, Math.min(x, windowW - w)),
            y: Math.max(TOP_OFFSET, Math.min(y, windowH - h))
        };
    };

    if (!node || !open) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => onOpenChange(false)} />

            <motion.div
                initial={false}
                animate={{
                    x: position.x,
                    y: position.y,
                    width: size.width,
                    height: size.height
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                dragConstraints={{
                    left: 0,
                    top: TOP_OFFSET,
                    right: typeof window !== 'undefined' ? window.innerWidth - size.width : 0,
                    bottom: typeof window !== 'undefined' ? window.innerHeight - size.height : 0
                }}
                onDragEnd={(e, info) => {
                    const clamped = clampPosition(
                        position.x + info.offset.x,
                        position.y + info.offset.y,
                        size.width,
                        size.height
                    );
                    setPosition(clamped);
                    setModalConfig({ ...size, ...clamped });
                }}
                className="absolute bg-[#1C1926] border border-[#4A4955] rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
                {/* Header / Drag Handle */}
                <div
                    className="h-12 border-b border-white/5 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing bg-[#252233] select-none"
                    onPointerDown={(e) => dragControls.start(e)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">
                            📦
                        </div>
                        <span className="font-semibold text-white">{node.data.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-auto">
                    <div className="h-full border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/30 bg-white/5">
                        <p>Settings for {node.data.label}</p>
                    </div>
                </div>

                {/* Custom Resize Logic Implementation */}
                <ResizableHandle
                    onResize={(w, h) => {
                        const { width: windowW, height: windowH } = getBoundaries();
                        // Max width/height to stay within window from current x/y
                        const maxWidth = windowW - position.x;
                        const maxHeight = windowH - position.y;

                        const newSize = {
                            width: Math.max(400, Math.min(w, maxWidth)),
                            height: Math.max(300, Math.min(h, maxHeight))
                        };
                        setSize(newSize);
                    }}
                    onResizeEnd={() => {
                        setModalConfig({ ...size, x: position.x, y: position.y });
                    }}
                />

            </motion.div>
        </div>
    );
}

// Helper for resizing
function ResizableHandle({ onResize, onResizeEnd }: { onResize: (w: number, h: number) => void, onResizeEnd: () => void }) {
    return (
        <div
            className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-20"
            onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = (e.currentTarget.parentElement as HTMLElement).offsetWidth;
                const startHeight = (e.currentTarget.parentElement as HTMLElement).offsetHeight;

                const handleMove = (moveEvent: PointerEvent) => {
                    const newWidth = startWidth + (moveEvent.clientX - startX);
                    const newHeight = startHeight + (moveEvent.clientY - startY);
                    onResize(newWidth, newHeight);
                };

                const handleUp = () => {
                    window.removeEventListener('pointermove', handleMove as any);
                    window.removeEventListener('pointerup', handleUp);
                    onResizeEnd();
                };

                window.addEventListener('pointermove', handleMove as any);
                window.addEventListener('pointerup', handleUp);
            }}
        >
            {/* Corner visual */}
            <svg width="16" height="16" viewBox="0 0 16 16" className="absolute bottom-1 right-1 text-white/30 pointer-events-none">
                <path d="M14 14L14 6M10 14L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
    )
}
