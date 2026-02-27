import React, { useEffect, useState, useRef, useCallback } from 'react';
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d';
import * as d3 from 'd3-force-3d';
import SpriteText from 'three-spritetext';

interface Node {
    id: string;
    name: string;
    group: string;
    val: number;
    x?: number;
    y?: number;
    z?: number;
}

interface Link {
    source: string | Node;
    target: string | Node;
    value: number;
    label: string;
    date?: string;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

const GraphViewer: React.FC = () => {
    const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState('');

    // State for side panel
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [connectedLinks, setConnectedLinks] = useState<Link[]>([]);

    const fgRef = useRef<ForceGraphMethods>();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth - 380, height: window.innerHeight - 80 });

    useEffect(() => {
        // Resize handler
        const handleResize = () => setDimensions({ width: window.innerWidth - 380, height: window.innerHeight - 80 });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Fetch data from backend
        fetch('/api/graph-data')
            .then((res) => res.json())
            .then((data) => {
                setGraphData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to load graph data:', err);
                setLoading(false);
            });
    }, []);

    // グラフの物理演算（間隔の調整）
    useEffect(() => {
        if (fgRef.current && !loading && graphData.nodes.length > 0) {
            // ForceGraph3D needs a slight delay to initialize forces internally before we can override them
            // Otherwise we get "Cannot read properties of undefined (reading 'tick')"
            setTimeout(() => {
                if (!fgRef.current) return;

                // 反発力を「動的」に設定：中心の巨大ノード（日銀・政府）ほど強烈に周囲を弾き飛ばすようにする
                const chargeForce = fgRef.current.d3Force('charge');
                if (chargeForce) {
                    chargeForce.strength((node: any) => {
                        const nodeName = node.name || '';
                        const isGovName = nodeName.endsWith('省') || nodeName.endsWith('庁') || nodeName.endsWith('府');
                        if (nodeName === '日本銀行' || node.group === 'central_bank') return -20000; // 日銀は超絶な力で弾く
                        if (node.group === 'government' || isGovName) return -8000;   // 省庁もかなり強く弾く
                        return -800; // 一般企業は普通の反発力
                    });
                }

                // 線（リンク）の長さをさらに大幅に伸ばす（300 -> 600）
                const linkForce = fgRef.current.d3Force('link');
                if (linkForce) {
                    linkForce.distance(600);
                }

                // ノード同士が重ならないようにする衝突判定を追加（ノードの半径＋たっぷりの余白）
                const collideForce = d3.forceCollide().radius((node: any) => {
                    const nodeName = node.name || '';
                    const isGovName = nodeName.endsWith('省') || nodeName.endsWith('庁') || nodeName.endsWith('府');
                    const baseVal = Math.max(1, Math.log10(node.val || 1) * 2);
                    const val = (node.group === 'government' || isGovName) ? baseVal * 2.5 : baseVal;
                    return (val * 4) + 10;
                }).iterations(2);

                fgRef.current.d3Force('collide', collideForce);

                // 再計算
                fgRef.current.d3ReheatSimulation();
            }, 100);
        }
    }, [graphData, loading]);

    const handleNodeClick = useCallback((node: Node) => {
        setSelectedNode(node);

        // Find all links connected to this node 
        // (ForceGraph modifies link.source/target from string to object after initialization)
        const links = graphData.links.filter(l => {
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            return sourceId === node.id || targetId === node.id;
        });
        setConnectedLinks(links);

        // Center and zoom in on clicked node using 3D camera
        if (fgRef.current) {
            const distance = 400; // Look at distance
            const targetX = node.x || 0;
            const targetY = node.y || 0;
            const targetZ = node.z || 0;

            const distRatio = 1 + distance / Math.hypot(targetX, targetY, targetZ);

            const newPos = (targetX || targetY || targetZ)
                ? { x: targetX * distRatio, y: targetY * distRatio, z: targetZ * distRatio }
                : { x: 0, y: 0, z: distance }; // special case if node is at (0,0,0)

            fgRef.current.cameraPosition(
                newPos, // new position
                node as any, // lookAt ({ x, y, z })
                2000  // ms transition duration
            );
        }
    }, [graphData.links]);

    const handleBackgroundClick = useCallback(() => {
        setSelectedNode(null);
        setConnectedLinks([]);
    }, []);

    const handleSearchClick = () => {
        if (!searchQuery) return;
        const targetNode = graphData.nodes.find(n => n.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (targetNode) {
            handleNodeClick(targetNode);
        } else {
            alert('見つかりませんでした');
        }
    };

    if (loading) return <div style={{ color: 'white', padding: '2rem' }}>読み込み中...</div>;

    return (
        <div style={{ background: '#1e1e1e', height: '100%', position: 'relative' }}>
            {/* Search Input */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="企業名や官公庁で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                    style={{
                        padding: '10px 15px', width: '250px', borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(30,30,30,0.85)',
                        color: 'white', backdropFilter: 'blur(5px)'
                    }}
                />
                <button onClick={handleSearchClick} style={{
                    padding: '10px 15px', borderRadius: '8px', background: '#4ecdc4',
                    color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                }}>検索</button>
            </div>

            {/* Legend Overlay */}
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 10, background: 'rgba(30, 30, 30, 0.85)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(5px)', fontSize: '0.9rem' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem' }}>凡例 (ノードの種類)</h4>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#FFD700', marginRight: '8px' }}></span> 日本銀行（資金の根本）</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#ff1744', marginRight: '8px' }}></span> 政府機関（省・庁・府）</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#00bcd4', marginRight: '8px' }}></span> 企業（一般調達の受注先）</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#2196F3', marginRight: '8px' }}></span> 政治家・関連団体</div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#4CAF50', marginRight: '8px' }}></span> 献金者（個人・企業）</div>
                <div style={{ display: 'flex', alignItems: 'center' }}><span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: '#FF9800', marginRight: '8px' }}></span> 政治活動の支出先</div>
            </div>

            {/* Data Source Citation Overlay */}
            <div style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 10, background: 'rgba(0, 0, 0, 0.6)', padding: '8px 20px',
                borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)',
                color: '#aaa', fontSize: '0.85rem', textAlign: 'center', pointerEvents: 'none'
            }}>
                データ出典: 政府調達情報（令和5年度〜6年度概算） ／ 総務省 政治資金収支報告書（令和4年分〜最新）等を統合・シミュレート
            </div>

            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                // Node styling
                nodeLabel="name"
                nodeRelSize={4}
                nodeResolution={8} // Lower geometry resolution for spheres (default is 16) to improve performance
                d3AlphaDecay={0.05} // Cool down physics faster so it stops recalculating positions as quickly
                warmupTicks={50}   // Pre-calculate some layout before rendering
                cooldownTicks={100} // Stop calculating completely after 100 ticks (drastically increases FPS once settled)
                nodeColor={(node: any) => {
                    const nodeName = node.name || '';
                    if (searchQuery && nodeName.toLowerCase().includes(searchQuery.toLowerCase())) return '#ffeb3b'; // Highlight searched
                    if (selectedNode && selectedNode.id === node.id) return '#ffeb3b'; // Highlight color (Yellow)
                    if (selectedNode && connectedLinks.some(l => l.source === node.id || l.target === node.id || (typeof l.source === 'object' && l.source.id === node.id) || (typeof l.target === 'object' && l.target.id === node.id))) return '#ffffff'; // Connected nodes

                    const isGovName = nodeName.endsWith('省') || nodeName.endsWith('庁') || nodeName.endsWith('府');
                    if (nodeName === '日本銀行' || node.group === 'central_bank') return '#FFD700'; // Gold for BOJ
                    if (node.group === 'government' || isGovName) return '#ff1744'; // Bright Crimson Red for Gov

                    if (node.group === 'takaichi_org') return '#2196F3'; // Blue for target orgs
                    if (node.group === 'donor') return '#4CAF50';        // Green for donors
                    if (node.group === 'vendor') return '#FF9800';       // Orange for vendors
                    if (node.group === 'company') return '#00bcd4';      // Cyan for standard Companies
                    return 'rgba(158, 158, 158, 0.4)'; // Dimmed default 
                }}
                nodeVal={(node: any) => {
                    const nodeName = node.name || '';
                    const isGovName = nodeName.endsWith('省') || nodeName.endsWith('庁') || nodeName.endsWith('府');
                    const baseVal = Math.max(1, Math.log10(node.val || 1) * 2);
                    // Make Bank of Japan massive as the root of all funds
                    if (nodeName === '日本銀行' || node.group === 'central_bank') return baseVal * 6;
                    // Make government nodes bigger so they stand out
                    return (node.group === 'government' || isGovName) ? baseVal * 2.5 : baseVal;
                }}
                linkColor={(link: any) => {
                    if (selectedNode) {
                        const isConnected = connectedLinks.some(cl => cl === link);
                        return isConnected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)';
                    }
                    return 'rgba(255, 255, 255, 0.1)';
                }}
                linkWidth={(link: any) => {
                    if (selectedNode) return connectedLinks.some(cl => cl === link) ? 2 : 0.2;
                    return 0.1; // Extremely thin default lines
                }}
                // Only show directional particles when a node is selected, and ONLY on connected links
                linkDirectionalArrowLength={(link: any) => selectedNode && connectedLinks.some(cl => cl === link) ? 3.5 : 0}
                linkDirectionalArrowRelPos={1}
                linkDirectionalParticles={(link: any) => selectedNode && connectedLinks.some(cl => cl === link) ? 2 : 0}

                /*
                // Render 3D Sprite Labels for selected networks (like the user drawing)
                nodeThreeObject={(node: any) => {
                    if (!selectedNode) return null;
                    const isSelected = node.id === selectedNode.id;
                    const isConnected = connectedLinks.some(l => l.source === node.id || l.target === node.id || (typeof l.source === 'object' && l.source.id === node.id) || (typeof l.target === 'object' && l.target.id === node.id));

                    if (isSelected || isConnected) {
                        const sprite: any = new SpriteText(node.name);
                        sprite.color = isSelected ? '#ffeb3b' : '#ffffff';
                        sprite.textHeight = 8;
                        sprite.fontWeight = 'bold';
                        sprite.backgroundColor = 'rgba(0,0,0,0.7)';
                        sprite.padding = [2, 1];
                        sprite.borderRadius = 2;

                        // Roughly calculate node radius offset for 3D sphere
                        const isGovName = node.name && (node.name.endsWith('省') || node.name.endsWith('庁') || node.name.endsWith('府'));
                        const baseVal = Math.max(1, Math.log10(node.val || 1) * 2);
                        let finalVal = (node.group === 'government' || isGovName) ? baseVal * 2.5 : baseVal;
                        if (node.name === '日本銀行' || node.group === 'central_bank') finalVal = baseVal * 6;

                        // node radius in 3D is Math.cbrt(finalVal) * nodeRelSize
                        const nodeRadius = Math.cbrt(finalVal) * 4;

                        // x, y, z might be undefined during initial tick
                        if (sprite.position && node.x !== undefined) {
                            sprite.position.y = nodeRadius + 8; // Float above the node
                        }

                        return sprite;
                    }
                    return null;
                }}
                */
                // Interactions
                onNodeClick={handleNodeClick}
                onBackgroundClick={handleBackgroundClick}
                backgroundColor="#1e1e1e"
            />

            {/* Info Panel Overlay */}
            {selectedNode && (
                <div className="info-panel">
                    <h2>{selectedNode.name}</h2>
                    <p className="node-type">分類: {
                        selectedNode.group === 'takaichi_org' ? '高市氏 関連団体' :
                            selectedNode.group === 'donor' ? '献金者 (個人・企業)' :
                                selectedNode.group === 'vendor' ? '支出先 (業者など)' : 'その他'
                    }</p>

                    <h3>関連する取引履歴</h3>
                    {connectedLinks.length > 0 && (
                        <p className="node-type" style={{ marginTop: '-10px', marginBottom: '15px', color: '#888' }}>
                            対象期間: {(() => {
                                const dates = connectedLinks.filter(l => l.date).map(l => new Date(l.date as string).getTime());
                                if (dates.length === 0) return '不明';
                                const minDate = new Date(Math.min(...dates));
                                const maxDate = new Date(Math.max(...dates));
                                const formatDate = (d: Date) => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
                                return minDate.getTime() === maxDate.getTime() ? formatDate(minDate) : `${formatDate(minDate)} 〜 ${formatDate(maxDate)}`;
                            })()}
                        </p>
                    )}
                    <ul className="transaction-list">
                        {[...connectedLinks]
                            .sort((a, b) => {
                                const dateA = a.date ? new Date(a.date).getTime() : 0;
                                const dateB = b.date ? new Date(b.date).getTime() : 0;
                                return dateB - dateA; // 新しい順（降順）
                            })
                            .map((link, idx) => {
                                const sourceObj = typeof link.source === 'object' ? link.source : { id: link.source, name: link.source };
                                const targetObj = typeof link.target === 'object' ? link.target : { id: link.target, name: link.target };

                                const isOutgoing = sourceObj.id === selectedNode.id;
                                const otherNodeName = isOutgoing ? targetObj.name : sourceObj.name;

                                return (
                                    <li key={idx} className={isOutgoing ? 'outgoing' : 'incoming'}>
                                        <div className="tx-direction" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{isOutgoing ? `➔ 支出先: ${otherNodeName}` : `⬅ 収入元: ${otherNodeName}`}</span>
                                            {link.date && <span style={{ fontSize: '0.75rem', color: '#888' }}>{link.date}</span>}
                                        </div>
                                        <div className="tx-amount">
                                            {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(link.value)}
                                        </div>
                                        <div className="tx-label">名目: {link.label}</div>
                                    </li>
                                );
                            })}
                    </ul>
                    {connectedLinks.length === 0 && <p className="node-type">取引履歴がありません</p>}
                </div>
            )}
        </div>
    );
};

export default GraphViewer;
