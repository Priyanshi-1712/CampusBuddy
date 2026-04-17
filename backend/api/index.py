from fastapi import FastAPI
# from app.main import app
app = FastAPI()

@app.get("/")
def home():
    return {"message": "Hello from FastAPI on Vercel"}