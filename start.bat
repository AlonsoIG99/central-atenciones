@echo off
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  🚀 CENTRAL DE ATENCIÓN - Inicializador Rápido                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Paso 1: Ir a carpeta backend
echo [1/4] Navegando a carpeta backend...
cd backend
if errorlevel 1 (
    echo Error: No se encontró la carpeta backend
    pause
    exit /b 1
)
echo ✓ Carpeta backend encontrada
echo.

REM Paso 2: Activar entorno virtual
echo [2/4] Activando entorno virtual...
if not exist "venv" (
    echo ⚠ Creando entorno virtual...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo ✓ Entorno virtual activado
echo.

REM Paso 3: Inicializar BD
echo [3/4] Inicializando base de datos...
python init_db.py
if errorlevel 1 (
    echo Error en la inicialización de BD
    pause
    exit /b 1
)
echo ✓ Base de datos lista
echo.

REM Paso 4: Iniciar servidor
echo [4/4] Iniciando servidor FastAPI...
echo.
echo ═══════════════════════════════════════════════════════════════
echo ✓ SISTEMA INICIADO CORRECTAMENTE
echo.
echo 🌐 API disponible en:     http://localhost:8000
echo 📚 Documentación API:     http://localhost:8000/docs
echo 🎨 Frontend:              abrir frontend/index.html
echo.
echo 🔐 Credenciales:
echo    Email: admin@central.com
echo    Contraseña: admin123
echo.
echo ⚠ NO CIERRES ESTA VENTANA MIENTRAS USES EL SISTEMA
echo ═══════════════════════════════════════════════════════════════
echo.

python -m uvicorn app:app --reload

pause
