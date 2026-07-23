# BharatScore

BharatScore is a credit scoring and lending platform with a FastAPI backend and a React/Vite frontend.

## Project Structure
- bharatscore_api/ - FastAPI application, routers, and API logic
- Frontend/score-lend-borrow-44157/ - React frontend built with Vite
- MLalgo/ and models/ - machine learning scripts and model artifacts

## Backend Setup
From the project root:

```powershell
python -m pip install -r bharatscore_api/requirements.txt
uvicorn bharatscore_api.main:app --reload
```

The API will be available at http://127.0.0.1:8000.

## Frontend Setup
From the project root:

```powershell
cd Frontend/score-lend-borrow-44157
npm install
npm run dev
```

The frontend will usually run at http://localhost:5173.

## Notes
- The legacy backend folder has been removed from the repository root.
- Use the FastAPI backend from bharatscore_api/ and the React frontend from Frontend/score-lend-borrow-44157/.

## Demo Vedio 
 https://www.loom.com/share/8f5b6d3fe17b4578a0e494ceffccc327
