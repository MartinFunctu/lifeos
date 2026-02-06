import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Box, Wallet } from 'lucide-react';

export interface ContextMenuProps {
    x: number;
    y: number;
    visible: boolean;
    onClose: () => void;
    onCreateNode: (type: string) => void;
}

const CanvasContextMenu = memo(({ x, y, visible, onClose, onCreateNode }: ContextMenuProps) => {
    if (!visible) return null;

    return (
        <div
            className="fixed z-[100] min-w-[280px] bg-[#1C1926]/95 backdrop-blur-2xl border border-[#4A4955] rounded-2xl shadow-2xl py-3 overflow-hidden animate-in fade-in zoom-in duration-150 ring-1 ring-white/5"
            style={{ top: y, left: x }}
            onMouseLeave={onClose}
        >
            <div className="px-4 py-2 text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1">
                Pridať blok
            </div>

            <button
                onClick={() => onCreateNode('finance')}
                className="w-full flex items-center gap-4 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all text-left group"
            >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                    <Wallet size={20} />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-white">Financie</span>
                    <span className="text-xs text-white/40">Investície, sporenie, výdavky</span>
                </div>
                <Plus size={16} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>

            {/* In the future we can add more types here */}
        </div>
    );
});

CanvasContextMenu.displayName = 'CanvasContextMenu';

export default CanvasContextMenu;
