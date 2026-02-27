import pandas as pd
import json
import os

def process_data(input_csv, output_json):
    df = pd.read_csv(input_csv)
    
    nodes = {}
    links = []
    
    for _, row in df.iterrows():
        buyer = row['buyer']
        seller = row['seller']
        amount = int(row['amount_jpy'])
        description = row['description']
        
        # Add buyer node if not exists
        if buyer not in nodes:
            group = 'government' if '庁' in buyer or '省' in buyer else 'company'
            nodes[buyer] = {"id": buyer, "name": buyer, "group": group, "val": 1}
        else:
            nodes[buyer]["val"] += 1
            
        # Add seller node if not exists
        if seller not in nodes:
            nodes[seller] = {"id": seller, "name": seller, "group": 'company', "val": 1}
        else:
            nodes[seller]["val"] += 1
            
        # Add link
        links.append({
            "source": buyer,
            "target": seller,
            "value": amount,
            "label": description
        })
        
    graph_data = {
        "nodes": list(nodes.values()),
        "links": links
    }
    
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(graph_data, f, ensure_ascii=False, indent=2)
    print(f"Data successfully written to {output_json}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    input_file = os.path.join(current_dir, 'raw_data.csv')
    output_file = os.path.join(current_dir, 'sample_data.json')
    process_data(input_file, output_file)
