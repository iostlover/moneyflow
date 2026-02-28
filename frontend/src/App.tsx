import React, { useEffect, useState } from 'react';
import GraphViewer from './components/GraphViewer';
import MacroOverview from './components/MacroOverview';
import './App.css';

function App() {
    const [visitorCount, setVisitorCount] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/visitor-count')
            .then(res => res.json())
            .then(data => setVisitorCount(data.count))
            .catch(() => setVisitorCount(null));
    }, []);

    return (
        <div className="app-container">
            <header className="app-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                        <h1>日本の資金の流れ可視化ダッシュボード</h1>
                        <p>ノード（プロから）をドラッグ・クリックして関係性を探索できます。赤は「政府機関」、緑は「企業」を示します。</p>
                    </div>
                    {visitorCount !== null && (
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                            marginLeft: '20px',
                            backdropFilter: 'blur(5px)',
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '2px' }}>👥 累計訪問者</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#4ecdc4' }}>
                                【{visitorCount.toLocaleString('ja-JP')}人目】
                            </div>
                        </div>
                    )}
                </div>
            </header>
            <main className="main-content">
                <aside className="left-sidebar">
                    <MacroOverview />
                </aside>
                <section className="graph-container">
                    <GraphViewer />
                </section>
            </main>
        </div>
    );
}

export default App;
