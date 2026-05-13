@echo off
echo.
echo ====================================
echo Content Repurposing Engine - Setup
echo ====================================
echo.

echo 1. Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo 2. Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo 3. Root dependencies for concurrent running...
call npm install

echo.
echo ====================================
echo ✅ Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Edit backend/.env with your OpenAI API key
echo 2. Run: npm run dev
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
pause
