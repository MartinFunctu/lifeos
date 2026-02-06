import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { IconDisplay } from './IconMapper';

export interface SubBlock {
    id: string;
    label: string;
    status?: 'online' | 'offline' | 'pending';
    subBlocks?: SubBlock[];
}

export interface ServiceNodeData extends Record<string, unknown> {
    label: string;
    status?: 'online' | 'offline' | 'pending';
    url?: string;
    volume?: string;
    subBlocks?: SubBlock[];
}

type ServiceNode = Node<ServiceNodeData, 'service'>;

const CanvasNode = memo(({ data, selected }: NodeProps<ServiceNode>) => {
    const statusColors = {
        online: 'bg-green-500',
        offline: 'bg-red-500',
        pending: 'bg-yellow-500',
    };

    const hasSubBlocks = data.subBlocks && data.subBlocks.length > 0;

    return (
        <div
            className={cn(
                "bg-[#161618] border rounded-lg p-4 shadow-xl transition-all",
                selected ? "border-blue-500 shadow-blue-500/20" : "border-white/10",
                // Dynamic sizing based on content, but minimum width ensures readability
                "min-w-[200px] h-full"
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center text-lg shrink-0">
                    <IconDisplay name={data.label} size={20} className="text-blue-400" />
                </div>
                <h3 className="font-semibold text-white text-sm truncate">{data.label}</h3>
            </div>

            {/* URL if exists */}
            {data.url && (
                <p className="text-xs text-white/50 mb-2 truncate">{data.url}</p>
            )}

            {/* Sub Blocks Grid */}
            {hasSubBlocks && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {data.subBlocks?.map((block) => (
                        <div key={block.id} className="bg-white/5 rounded p-2 flex flex-col items-center gap-1 hover:bg-white/10 transition-colors cursor-pointer group">
                            <div className="text-xl group-hover:scale-110 transition-transform">
                                <IconDisplay name={block.label} size={24} className="text-white/90" />
                            </div>
                            <span className="text-[10px] text-white/70 text-center truncate w-full">
                                {block.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Status (only show if no sub-blocks or specifically requested, keeping it for backward compat) */}
            {!hasSubBlocks && data.status && (
                <div className="flex items-center gap-2 mb-3 mt-2">
                    <div className={cn("w-2 h-2 rounded-full", statusColors[data.status])} />
                    <span className={cn(
                        "text-xs capitalize",
                        data.status === 'online' && "text-green-500",
                        data.status === 'offline' && "text-red-500",
                        data.status === 'pending' && "text-yellow-500"
                    )}>
                        {data.status}
                    </span>
                </div>
            )}

            {/* Volume if exists */}
            {data.volume && (
                <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-white/50 text-xs mt-2">
                    <span>💾</span>
                    <span className="truncate">{data.volume}</span>
                </div>
            )}
        </div>
    );
});

CanvasNode.displayName = 'CanvasNode';

export default CanvasNode;
