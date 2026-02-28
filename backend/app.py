from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for prototype
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

COUNTER_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'visitor_count.json')

def load_count():
    if not os.path.exists(COUNTER_FILE):
        return 0
    with open(COUNTER_FILE, 'r') as f:
        return json.load(f).get('count', 0)

def save_count(count):
    with open(COUNTER_FILE, 'w') as f:
        json.dump({'count': count}, f)

@app.get("/api/visitor-count")
def get_visitor_count():
    count = load_count() + 1
    save_count(count)
    return {"count": count}

@app.get("/api/graph-data")
def get_graph_data():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # The JSON data is stored in the data_processor directory
    data_path = os.path.join(current_dir, '..', 'data_processor', 'sample_data.json')
    
    if not os.path.exists(data_path):
        return {"nodes": [], "links": []}
        
    with open(data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    return data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
