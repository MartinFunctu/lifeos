import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import { pb } from '@/lib/pocketbase';
import {
    ReactFlow,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    type Node,
    type Edge,
    type Connection,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CanvasNode, { type ServiceNodeData } from '@/components/canvas/CanvasNode';
import CanvasControls from '@/components/canvas/CanvasControls';
import CanvasContextMenu from '@/components/canvas/CanvasContextMenu';
import ChatbotAgent from '@/components/canvas/ChatbotAgent';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/Breadcrumbs';

const nodeTypes = {
    service: CanvasNode,
};

type ServiceNode = Node<ServiceNodeData, 'service'>;

function AdminDashboardContent() {
    const { t } = useTranslation();
    const [nodes, setNodes, onNodesChange] = useNodesState<ServiceNode>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { screenToFlowPosition, fitView } = useReactFlow();

    // Navigation state
    const [viewPath, setViewPath] = useState<BreadcrumbItem[]>([]);
    const currentViewId = viewPath.length > 0 ? viewPath[viewPath.length - 1].id : null;

    const [menu, setMenu] = useState<{ x: number, y: number, visible: boolean }>({
        x: 0,
        y: 0,
        visible: false
    });

    // Helper to get auth headers
    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pb.authStore.token}`,
    });

    // Fetch nodes and edges from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = getAuthHeaders();
                const [nodesRes, edgesRes] = await Promise.all([
                    fetch('/api/canvas/nodes', { headers }),
                    fetch('/api/canvas/edges', { headers }),
                ]);

                if (!nodesRes.ok || !edgesRes.ok) {
                    throw new Error('Failed to fetch canvas data');
                }

                const nodesData = await nodesRes.json();
                const edgesData = await edgesRes.json();

                // Transform API data to React Flow format
                const transformedNodes: ServiceNode[] = nodesData.map((node: any) => ({
                    id: node.id,
                    type: 'service',
                    position: { x: node.x, y: node.y },
                    data: {
                        label: node.label,
                        ...node.data,
                    },
                    // Important: Store parentId in data for now to filter locally
                    parentId: node.data.parentId,
                }));

                const transformedEdges: Edge[] = edgesData.map((edge: any) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    type: edge.type || 'default',
                }));

                setNodes(transformedNodes);
                setEdges(transformedEdges);
            } catch (error) {
                console.error('Failed to fetch canvas data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [setNodes, setEdges]);

    // Filter nodes based on current view
    const visibleNodes = nodes.filter(node => {
        const nodeParentId = node.data.parentId || null;
        return nodeParentId === currentViewId;
    });

    // Handle node drag end - persist position to database
    const onNodeDragStop = useCallback(async (_event: React.MouseEvent, node: Node) => {
        try {
            await fetch(`/api/canvas/nodes/${node.id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    x: node.position.x,
                    y: node.position.y,
                }),
            });
        } catch (error) {
            console.error('Failed to update node position:', error);
        }
    }, []);

    // Handle connection creation
    const onConnect = useCallback(async (connection: Connection) => {
        const edgeId = `edge-${connection.source}-${connection.target}`;

        try {
            await fetch('/api/canvas/edges', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    id: edgeId,
                    source: connection.source,
                    target: connection.target,
                }),
            });

            setEdges((eds) => addEdge({ ...connection, id: edgeId }, eds));
        } catch (error) {
            console.error('Failed to create edge:', error);
        }
    }, [setEdges]);

    const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        setMenu({
            x: event.clientX,
            y: event.clientY,
            visible: true
        });
    }, []);

    const handleCreateNode = useCallback(async (type: string) => {
        const position = screenToFlowPosition({ x: menu.x, y: menu.y });
        const timestamp = Date.now();
        const id = `node-${type}-${timestamp}`;
        let newNodesToCreate: ServiceNode[] = [];

        try {
            // Persist all nodes
            await Promise.all(newNodesToCreate.map(node =>
                fetch('/api/canvas/nodes', {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        id: node.id,
                        type: 'service',
                        label: node.data.label,
                        x: node.position.x,
                        y: node.position.y,
                        data: node.data,
                    }),
                })
            ));

            setNodes((nds) => [...nds, ...newNodesToCreate]);
        } catch (error) {
            console.error('Failed to create node:', error);
        }

        setMenu(prev => ({ ...prev, visible: false }));
    }, [menu, screenToFlowPosition, setNodes, currentViewId]);

    const closeMenu = useCallback(() => {
        setMenu(prev => ({ ...prev, visible: false }));
    }, []);

    // Navigation Handlers
    const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
        // If the node has children or specific navigation intention
        // For now, we assume if it has subBlocks in data, it's navigable.
        // Or we can just allow drilling into any node to create sub-canvases.
        const serviceNode = node as ServiceNode;
        if (serviceNode.data.subBlocks && serviceNode.data.subBlocks.length > 0) {
            setViewPath(prev => [...prev, { id: node.id, label: serviceNode.data.label }]);
            setTimeout(() => fitView({ duration: 500 }), 50); // Small delay to allow render
        }
    }, [fitView]);

    const handleNavigate = useCallback((id: string, index: number) => {
        if (id === 'root') {
            setViewPath([]);
        } else {
            setViewPath(prev => prev.slice(0, index + 1));
        }
        setTimeout(() => fitView({ duration: 500 }), 50);
    }, [fitView]);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-4rem)] w-full bg-[#13111C] flex items-center justify-center overflow-hidden">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-white/30 text-sm font-medium animate-pulse">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-[#13111C] px-4 pb-4 pt-2 overflow-hidden flex flex-col">
            {viewPath.length > 0 && (
                <Breadcrumbs items={viewPath} onNavigate={handleNavigate} />
            )}

            <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#4A4955] relative">
                <ReactFlow
                    nodes={visibleNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDragStop={onNodeDragStop}
                    onPaneContextMenu={onPaneContextMenu}
                    onNodeDoubleClick={handleNodeDoubleClick}
                    onPaneClick={closeMenu}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-[#13111C]"
                    proOptions={{ hideAttribution: true }}
                    snapToGrid={true}
                    snapGrid={[20, 20]}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1}
                        color="#4A4955"
                    />
                    <CanvasControls />
                    <ChatbotAgent />
                    <CanvasContextMenu
                        {...menu}
                        onClose={closeMenu}
                        onCreateNode={handleCreateNode}
                    />
                </ReactFlow>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <ReactFlowProvider>
            <AdminDashboardContent />
        </ReactFlowProvider>
    );
}
