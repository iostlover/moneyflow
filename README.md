# 💴 日本の資金の流れ可視化ダッシュボード (Money Flow Analyzer)

日本の公共データ（政治資金収支報告書・政府調達情報）をネットワークグラフとしてインタラクティブに可視化するプロトタイプシステムです。

## 機能

- 🌐 3Dインタラクティブ・ネットワークグラフ（Three.js / react-force-graph-3d）
- 🏛 省庁・政治家・企業間の資金の流れを可視化
- 🔍 ノード名による検索機能
- 📊 国家予算マクロデータとミクロデータの統合表示
- ⚡ FastAPI バックエンド + React/Vite フロントエンド

## データ出典

- 政府調達情報（令和5〜6年度概算）  
- 総務省 政治資金収支報告書（令和4年分〜最新）  
- e-Stat / data.go.jp 等の政府オープンデータ

## 技術スタック

- **フロントエンド:** React, TypeScript, Vite, react-force-graph-3d, Three.js
- **バックエンド:** Python, FastAPI, Uvicorn, Pandas
- **インフラ:** Nginx, PM2, Ubuntu (VPS)

## ライセンス

**個人・非営利・研究目的:** GNU Affero General Public License v3.0 (AGPL-3.0) に基づき無償利用可  
**商業利用・販売・SaaS提供:** 作者との別途有償ライセンス契約が必要です。  
Contact: https://github.com/iostlover

Copyright (c) 2025 iostlover. All commercial rights reserved.
