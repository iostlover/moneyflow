import React from 'react';

const MacroOverview: React.FC = () => {
    return (
        <div className="macro-panel">
            <h2>国家予算 オーバービュー</h2>
            <p className="subtitle">令和6年度 一般会計予算（概算）</p>

            <div className="budget-card total">
                <span className="label">国家予算総額</span>
                <span className="value">約112.5兆円</span>
            </div>

            <div className="budget-section">
                <h3>① 社会保障関係費</h3>
                <div className="budget-card">
                    <span className="label">総合計（最大項目：約1/3）</span>
                    <span className="value">約37.7兆円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">∟ 年金・医療・介護等</span>
                </div>
                <div className="budget-sub-item highlight-red">
                    <span className="sub-label">∟ 生活保護費（国負担分等）</span>
                </div>
                <div className="budget-sub-item highlight-yellow">
                    <span className="sub-label">∟ 子育て支援等</span>
                </div>
            </div>

            <div className="budget-section">
                <h3>② 国債費</h3>
                <div className="budget-card">
                    <span className="label">総合計（実質2番目）</span>
                    <span className="value">約27.0兆円</span>
                </div>
                <div className="budget-sub-item highlight-red">
                    <span className="sub-label">∟ 国の借金（国債）の返済・利息支払い</span>
                </div>
            </div>

            <div className="budget-section">
                <h3>③ 地方交付税交付金等</h3>
                <div className="budget-card">
                    <span className="label">総合計</span>
                    <span className="value">約17.8兆円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">∟ 都道府県・市町村への配分、地方行政維持費</span>
                </div>
            </div>

            <div className="budget-section">
                <h3>④ 防衛関係費</h3>
                <div className="budget-card">
                    <span className="label">総合計</span>
                    <span className="value">約7.9兆円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">∟ 自衛隊運用・装備調達・防衛力強化</span>
                </div>
            </div>

            <div className="budget-section">
                <h3>⑤ 公共事業関係費</h3>
                <div className="budget-card">
                    <span className="label">総合計</span>
                    <span className="value">約6.1兆円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">∟ 道路・港湾・河川・インフラ整備</span>
                </div>
            </div>

            <div className="budget-section">
                <h3>⑥ 文教及び科学振興費</h3>
                <div className="budget-card">
                    <span className="label">総合計</span>
                    <span className="value">約5.4兆円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">∟ 学校教育・大学・研究開発・科学技術</span>
                </div>
            </div>

            <div className="budget-section">
                <h3>⑦～⑪ その他の主要経費</h3>
                <div className="budget-sub-item">
                    <span className="sub-label">⑦ 経済協力費（ODA、国際支援等）</span>
                    <span className="sub-value">約5,650億円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">⑧ 中小企業対策費（補助金等）</span>
                    <span className="sub-value">約1,690億円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">⑨ エネルギー対策費（再エネ等）</span>
                    <span className="sub-value">約7,900億円</span>
                </div>
                <div className="budget-sub-item">
                    <span className="sub-label">⑩ 食料安定供給関係費</span>
                    <span className="sub-value">約2.0兆円</span>
                </div>
                <div className="budget-sub-item highlight-red">
                    <span className="sub-label">⑪ その他（予備費、災害対応等）</span>
                    <span className="sub-value">約1.0兆円</span>
                </div>
            </div>

            <div className="macro-footer">
                <p>※数値は目安となる概算値です。中央のグラフからは、これらの巨大な予算が「どの企業や団体に」具体的に発注・交付されているかのミクロな流れを検索・追跡できます。</p>
            </div>
        </div>
    );
};

export default MacroOverview;
