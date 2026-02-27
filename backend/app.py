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
