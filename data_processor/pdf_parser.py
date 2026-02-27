import pandas as pd
import json
import os

def process_political_funds(input_csv, output_json):
    df = pd.read_csv(input_csv)
    
    nodes = {}
    links = []
    
    # ターゲット（高市氏関連団体）のリスト。UIで中心として扱う。
    target_groups = [
        "高市早苗後援会", 
        "自由民主党奈良県第二選挙区支部", 
        "新時代政策研究会(高市早苗)", 
        "高市早苗を日本初の女性総理大臣にする会"
    ]
    
    for _, row in df.iterrows():
        source = str(row['source'])
        target = str(row['target'])
        amount = int(row['amount_jpy'])
        description = str(row['description'])
        tx_type = str(row['type'])
        date = str(row['date'])
        
        # Add source node
        if source not in nodes:
            group = 'takaichi_org' if source in target_groups else 'donor' if tx_type == 'income' else 'vendor'
            nodes[source] = {"id": source, "name": source, "group": group, "val": 1}
        else:
            nodes[source]["val"] += 1
            
        # Add target node
        if target not in nodes:
            group = 'takaichi_org' if target in target_groups else 'vendor' if tx_type == 'expenditure' else 'donor'
            nodes[target] = {"id": target, "name": target, "group": group, "val": 1}
        else:
            nodes[target]["val"] += 1
            
        # Add link
        links.append({
            "source": source,
            "target": target,
            "value": amount,
            "label": description,
            "tx_type": tx_type,
            "date": date
        })
        
    graph_data = {
        "nodes": list(nodes.values()),
        "links": links
    }
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(graph_data, f, ensure_ascii=False, indent=2)
    print(f"Political funds data successfully written to {output_json}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(current_dir, 'takaichi_funds.csv')
    output_file = os.path.join(current_dir, 'sample_data.json')
    process_political_funds(input_file, output_file)
