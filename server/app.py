from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
import requests, json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.post('/v1/databases/{database_id}/query')
def fetch_notion_data(database_id: str):
    """Fetch data from Notion"""
    x = requests.post(
        f"https://api.notion.com/v1/databases/{database_id}/query",
        headers={
            "Authorization" : f"Bearer {os.getenv('NOTION_API_KEY')}",
            "Notion-Version": "2022-06-28"
        })
    return json.loads(x.content)

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8080, reload=True)
