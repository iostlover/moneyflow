import React from 'react';
import GraphViewer from './components/GraphViewer';
import MacroOverview from './components/MacroOverview';
import './App.css';
import './App.css';

function App() {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>日本の資金の流れ可視化ダッシュボード</h1>
                <p>ノード（プロから）をドラッグ・クリックして関係性を探索できます。赤は「政府機関」、緑は「企業」を示します。</p>
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
