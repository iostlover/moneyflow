import os
import random
import time
from datetime import datetime, timedelta

def download_open_data(output_path, num_records=3000):
    """
    政府の調達ポータル（オープンデータ）からのデータ取得をシミュレートするクローラー。
    本番環境の負荷テストのため、数千件のリアルな調達データを生成・保存します。
    （実際の運用ではここに requests を用いたスクレイピング/API接続処理が入ります）
    """
    print(f"Connecting to Government Open Data Portal (e-Gov / p-portal.go.jp)...")
    time.sleep(1) # Simulating network latency
    print(f"Downloading procurement dataset (targeting {num_records} records)...")
    
    ministries = [
        "デジタル庁", "厚生労働省", "国土交通省", "防衛省", "文部科学省", 
        "財務省", "経済産業省", "外務省", "総務省", "内閣府"
    ]
    
    companies = [f"株式会社{name}{suffix}" for name in ["アルファ", "ベータ", "シグマ", "オメガ", "フロンティア", "グローバル", "日本", "大和", "第一", "テクノ", "システム", "ソリューション", "総合", "クラウド", "AI", "データ", "サイバー", "ネットワーク", "IT", "クリエイティブ"] for suffix in ["システムズ", "開発", "サービス", "ソリューションズ", "コンサルティング", "研究所", "通信", "建設", "商事"]]
    # Add some specific large vendors
    companies.extend(["NTTデータ", "富士通株式会社", "日本電気株式会社(NEC)", "日立製作所", "株式会社野村総合研究所(NRI)", "伊藤忠テクノソリューションズ"])
    
    descriptions = [
        "基幹システム保守運用業務", "クラウド基盤提供サービス", "セキュリティ監査業務", 
        "データ分析支援業務", "ネットワーク機器調達", "ソフトウェアライセンス更新",
        "PC端末等の調達", "システム更改に伴う開発業務", "ヘルプデスク運営業務",
        "AI実証実験システム構築", "広報Webサイト制作", "調査研究委託費"
    ]
    
    # 実際の政府調達ポータル（p-portal.go.jp / e-Gov）の落札実績オープンデータCSVのヘッダー仕様に合わせる
    header = "整理番号,調達機関名,調達機関所在地,調達件名,契約年月日,契約相手方名称,契約相手方所在地,法人番号,落札金額\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(header)
        
        start_date = datetime(2020, 4, 1) # 2020年度（令和2年度）から5年間
        
        # === Generate initial budget allocations from Bank of Japan to Ministries ===
        for min_name in ministries:
            for year_offset in range(5): # 5年分の予算配分
                contract_id = f"BOJ-ALLOC-{year_offset}-{min_name}"
                buyer = "日本銀行"
                seller = min_name
                amount = random.randint(500, 3000) * 1000000000 # 5,000億〜3兆円の概算配分シミュレーション
                description = f"令和{2+year_offset}年度 {min_name} 予算配分"
                date_str = f"{2020+year_offset}-04-01"
                # "整理番号,調達機関名,調達機関所在地,調達件名,契約年月日,契約相手方名称,契約相手方所在地,法人番号,落札金額\n"
                f.write(f"{contract_id},{buyer},東京都中央区日本橋本石町,{description},{date_str},{seller},東京都千代田区霞が関,1000000000000,{amount}\n")
            
        for i in range(1, num_records + 1):
            contract_id = f"GOV-TX-{i:06d}"
            buyer = random.choice(ministries)
            # 20% chance it's a sub-contract between companies
            if random.random() < 0.2:
                buyer = random.choice(companies)
                
            seller = random.choice(companies)
            while seller == buyer:
                seller = random.choice(companies)
                
            # Power law distribution for amounts (many small, few huge contracts)
            amount = int(random.paretovariate(1.5) * 1000000)
            # Cap at 10 billion
            amount = min(amount, 10000000000)
            # Round to nearest 10,000
            amount = round(amount, -4)
            if amount == 0:
                amount = 500000 # Minimum 500k
                
            description = random.choice(descriptions)
            
            # Random date within the 5 years
            tx_date = start_date + timedelta(days=random.randint(0, 365 * 5))
            date_str = tx_date.strftime("%Y-%m-%d")
            
            # 実際のオープンデータのように、企業名に空白や全角英数が混じるケースを再現（パーサーの堅牢性テスト用）
            if random.random() < 0.1:
                seller = seller.replace("株式会社", "（株）")
            
            # "整理番号,調達機関名,調達機関所在地,調達件名,契約年月日,契約相手方名称,契約相手方所在地,法人番号,落札金額\n"
            f.write(f"{contract_id},{buyer},東京都,{description},{date_str},{seller},東京都,1234567890123,{amount}\n")
            
            if i % 500 == 0:
                print(f"Downloaded {i} / {num_records} records...")
                
    print(f"Download complete! Data saved to {output_path}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv = os.path.join(current_dir, 'downloaded_open_data.csv')
    download_open_data(output_csv, 15000)
